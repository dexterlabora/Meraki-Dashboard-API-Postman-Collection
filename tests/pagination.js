/**
 * Postman Pagination Script
 *
 * This script is designed to handle pagination in APIs by extracting
 * the necessary information from the Link header of the HTTP response.
 * It then sets the startingAfter and endingBefore environment variables
 * in Postman which can be used as query parameters for subsequent API
 * calls to navigate through paginated data.
 *
 * How to Use:
 * 1. Make an initial API call to an endpoint that supports pagination.
 * 2. Add this script to the "Tests" section of your Postman request.
 * 3. If the response contains a Link header with pagination links,
 *    the script will parse it and set the startingAfter or endingBefore
 *    environment variables.
 * 4. Use these environment variables in your Postman collection as query
 *    parameters for the remaining pagination calls.
 */

function parseLinkHeader(header) {
    const links = {};
    const entries = header.split(', ');
    entries.forEach(entry => {
        const parts = entry.split('; ');
        if (parts.length === 2) {
            const urlPart = parts[0];
            const relPart = parts[1];
            const url = urlPart.slice(1, -1);  // Remove the angle brackets
            const relMatch = relPart.match(/rel="?([^"]+)"?/);  
            if (relMatch) {
                const rel = relMatch[1];
                const params = {};
                const urlParts = url.split('?');
                if (urlParts.length > 1) {
                    const queryParams = urlParts[1].split('&');
                    queryParams.forEach(param => {
                        const [key, value] = param.split('=');
                        params[key] = decodeURIComponent(value);  // Decode the URL-encoded value
                    });
                    // console.log('Parsed params:', params);
                    links[rel] = params;
                } else {
                    console.log("No query parameters found in URL:", url);
                }
            } else {
                console.log("No rel value found in entry:", entry);
            }
        } else {
            console.log("Unexpected entry format:", entry);
        }
    });
    return links;
}

const linkHeader = pm.response.headers.get('Link');
if(linkHeader){
    // console.log('Link header found:', linkHeader);
    const parsedLinks = parseLinkHeader(linkHeader);
    pm.environment.set("parsedLinks", JSON.stringify(parsedLinks));
    // console.log('Parsed links:', JSON.stringify(parsedLinks));
    // Check if the 'next' link is present, and if so, save its query parameters as environment variables
    if (parsedLinks.next) {
        const startingAfter = parsedLinks.next.startingAfter;
        console.log("Pagination: Set environment variable:  startingAfter", startingAfter);
        pm.environment.set("startingAfter", startingAfter);
    }
    // Similar block for 'prev', if it's present
    if (parsedLinks.prev) {
        const endingBefore = parsedLinks.prev.endingBefore;
        console.log("Pagination: Set environment variable:  endingBefore", endingBefore);
        pm.environment.set("endingBefore", endingBefore);
    }
} else {
    console.log('No Link header found.');
}
