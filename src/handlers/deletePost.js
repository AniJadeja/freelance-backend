/**
 * Handles DELETE /posts/:slug
 * @param {Request} request 
 * @param {Env} env 
 * @param {string} slug 
 * @returns {Response}
 */
export async function deletePost(request, env, slug) {
  // .delete() removes the key if it exists
  await env.POD_BLOG_CONTENT.delete(slug);

  // Return 204 No Content for a successful deletion
  return new Response(`Post "${slug}" deleted successfully.`, { 
    status: 200 
  });
}