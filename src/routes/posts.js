import { createPost } from "../handlers/createPost";
import { getPost } from "../handlers/getPost";
import { getPosts } from "../handlers/getPosts";
import { deletePost } from "../handlers/deletePost";

/**
 * Routes requests based on HTTP method and slug existence.
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export function postRouter(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Check if a specific slug is requested (e.g., /posts/first-post)
  const isSinglePost = path.length > 7; // Length of "/posts/" is 7
  const slug = isSinglePost ? path.substring(7) : null;
  
  if (isSinglePost) {
    // Routes for a SINGLE post: /posts/:slug
    if (method === "POST") {
      // POST is used for both Create and Update (since key is idempotent)
      return createPost(request, env, slug);
    } else if (method === "GET") {
      return getPost(request, env, slug);
    } else if (method === "DELETE") {
      return deletePost(request, env, slug);
    }
  } else {
    // Routes for the LIST endpoint: /posts
    if (method === "GET") {
      return getPosts(request, env);
    }
  }
  
  // If no specific route or method is matched
  return new Response(`Method ${method} not supported for this path.`, { status: 405 });
}