/**
 * Handles DELETE /posts/:slug
 * @param {Request} request 
 * @param {Env} env 
 * @param {string} slug 
 * @returns {Response}
 */
export async function deletePost(request, env, slug) {
  // .delete() removes the key if it exists. KV delete operations are idempotent.
  await env.POD_BLOG_CONTENT.delete(slug);

  // Construct the JSON success response
  const responseBody = {
    success: true,
    message: `Post "${slug}" deleted successfully.`,
    slug: slug,
  };

  // Return 200 OK with a JSON body and Content-Type header.
  // While 204 No Content is standard for DELETE with no body, 
  // 200 OK is used here to accommodate the requested JSON body.
  return new Response(JSON.stringify(responseBody), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' }
  });
}
