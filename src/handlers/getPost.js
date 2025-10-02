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
    return new Response(`Post "${slug}" not found.`, { status: 404 });
  }
  
  // Returns a NEW Response object with the content
  return new Response(markdownContent, {
    status: 200,
    headers: { 
        "Content-Type": "text/markdown; charset=utf-8" 
    },
  });
}