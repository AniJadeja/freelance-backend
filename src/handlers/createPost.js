/**
 * Handles POST /posts/:slug (Create/Update)
 * @param {Request} request 
 * @param {Env} env 
 * @param {string} slug 
 * @returns {Response}
 */
export async function createPost(request, env, slug) {
  let content;
  try {
    // Attempt to parse the JSON body
    ( content  = await JSON.stringify(await request.json()));
    console.log("Content adding : ",content)
  } catch (error) {
    // Handle case where body is not valid JSON
    return new Response(JSON.stringify({
        success: false,
        message: "Invalid JSON body. Please ensure the request body is valid JSON."
    }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!content) {
      // Return a JSON error response for missing content
      return new Response(JSON.stringify({
          success: false,
          message: "Missing 'content' field in JSON body."
      }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  // Use .put() to write the content to KV
  await env.POD_BLOG_CONTENT.put(slug, content);
  
  // Construct the JSON success response
  const responseBody = {
      success: true,
      message: `Post "${slug}" saved/updated successfully.`,
      slug: slug,
      status: 201
  };
  
  // Return the JSON response with Content-Type header set
  return new Response(JSON.stringify(responseBody), { 
      status: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' }
  });
}
