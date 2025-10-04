/**
 * Handles GET /posts (Listing all slugs)
 * @param {Request} request
 * @param {Env} env
 * @returns {Response}
 */
export async function getPosts(request, env) {
	// 1. Get all keys (slugs) from the KV namespace
	const { keys } = await env.POD_BLOG_CONTENT.list();
	const slugs = keys.map((key) => key.name);

	// 2. Generate post summaries by fetching content directly
	const postArray = await getPostSummaries(slugs, env);

	// 3. Return the final list of summaries
	return new Response(
		JSON.stringify({
			postArray,
			count: postArray.length,
		}),
		{
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		}
	);
}

/**
 * Fetches and processes content for a list of slugs, creating an array of post summaries.
 * NOTE: This function now contains the logic previously in getPost.
 * * @param {string[]} slugs - Array of KV keys (slugs)
 * @param {Env} env - The Workers environment object
 * @returns {Promise<Array<Object>>} - An array of simplified post objects
 */
async function getPostSummaries(slugs, env) {
  // Use a simple counter or define the character limit clearly
  const DESCRIPTION_LIMIT = 80;
  let id = 0; // Initialize id counter

  // 1. Create an array of Promises for fetching and processing each slug
  const promises = slugs.map(async (slug) => {
    // --- START: Integrated Logic from getPost ---

    // a. Fetch the raw value (as text)
    const rawContent = await env.POD_BLOG_CONTENT.get(slug);

    if (rawContent === null) {
      console.warn(`KV entry not found for slug: ${slug}`);
      return null;
    }

    let data;
    try {
      // b. Attempt to parse the content as JSON
      data = JSON.parse(rawContent);
    } catch (e) {
      // c. Catch the SyntaxError
      console.error(`Skipping slug '${slug}': KV data is not valid JSON (e.g., old raw Markdown format).`);
      return null;
    }

    // --- END: Integrated Logic from getPost ---

    // Increment ID for each successful post
    id++;

    // 2. **Implement Truncation Logic for Description**
    let truncatedDescription = data.description || ""; // Fallback to an empty string

    if (truncatedDescription.length > DESCRIPTION_LIMIT) {
      // Truncate and append ellipsis
      truncatedDescription = truncatedDescription.substring(0, DESCRIPTION_LIMIT) + "...";
    }

    // 3. Format the required fields into the desired summary object.
    const jsonMrkDwn = {
      id: id, // Use the incremented ID
      title: data.title,
      // Use the truncated description
      description: truncatedDescription,
      image: data.image,
      // Access the first tag safely
      category: data.tags && data.tags.length > 0 ? data.tags[0] : null,
      link: "/blog/" + slug, // Include the slug for easy reference
    };

    return jsonMrkDwn;
  });

  // 4. Wait for all promises to resolve.
  const results = await Promise.all(promises);

  // 5. Filter out any null results (from missing/corrupted entries).
  return results.filter((item) => item !== null);
}