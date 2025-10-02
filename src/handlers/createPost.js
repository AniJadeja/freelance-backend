/**
 * Handles POST /posts/:slug (Create/Update)
 * @param {Request} request 
 * @param {Env} env 
 * @param {string} slug 
 * @returns {Response}
 */
export async function createPost(request, env, slug) {
  const { content } = await request.json();
  
  if (!content) {
      return new Response("Missing 'content' field in JSON body.", { status: 400 });
  }

  // Use .put() to write the content (KV is idempotent)
  await env.POD_BLOG_CONTENT.put(slug, content);
  
  return new Response(`Post "${slug}" saved/updated successfully.`, { 
      status: 201 // 201 Created is often used for POST
  });
}