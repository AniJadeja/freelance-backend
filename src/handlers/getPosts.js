/**
 * Handles GET /posts (Listing all slugs)
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export async function getPosts(request, env) {
  const { keys } = await env.POD_BLOG_CONTENT.list();
  const slugs = keys.map(key => key.name);
  
  return new Response(JSON.stringify({ 
      slugs, 
      count: slugs.length 
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}