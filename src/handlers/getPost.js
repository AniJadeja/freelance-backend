/**
 * Handles GET /posts/:slug (Read Single Post)
 * @param {Request} request 
 * @param {Env} env 
 * @param {string} slug 
 * @returns {Response}
 */
export async function getPost(request, env, slug) {
  // .get() returns null if the key doesn't exist
  const markdownContent = await env.POD_BLOG_CONTENT.get(slug);
  
  if (markdownContent === null) {
    // Return JSON error response for consistency
    const errorResponse = {
      message: `Post "${slug}" not found.`,
      slug: slug
    };
    return new Response(JSON.stringify(errorResponse), { 
      status: 404,
      headers: { 
        "Content-Type": "application/json; charset=utf-8" 
      },
    });
  }
  
  // Create a JSON object to hold the post data
  const postData = {
    slug: slug,
    data: JSON.parse(markdownContent),
    // You might add other fields here (e.g., title, date) if you retrieve them
  };
  
  // Returns a NEW Response object with the JSON content
  return new Response(JSON.stringify(postData), {
    status: 200,
    headers: { 
        // Set Content-Type to application/json
        "Content-Type": "application/json; charset=utf-8" 
    },
  });
}