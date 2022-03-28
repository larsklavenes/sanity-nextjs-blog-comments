import { groq } from 'next-sanity'
import client, { previewClient } from './sanity'

const getUniquePosts = posts => {
  const slugs = new Set()

  return posts.filter(post => {
    if (slugs.has(post.slug)) {
      return false
    } else {
      slugs.add(post.slug)
      return true
    }
  })
}

const postFields = `
  _id,
  seo,
  name,
  title,
  'date': publishedAt,
  excerpt,
  'slug': slug.current,
  'coverImage': mainImage,
  'author': author->{name, 'picture': image.asset->url},
`

const getClient = preview => (preview ? previewClient : client)

export async function getPreviewPostBySlug(slug) {
  const query = groq`*[_type == "post" && slug.current == $slug] | order(publishedAt desc){
    ${postFields}
    body
  }`
  const data = await getClient(true).fetch(query, { slug })

  return data[0]
}

export async function getAllPostsWithSlug() {
  const query = groq`*[defined(slug.current)][].slug.current`
  const data = await getClient(false).fetch(query)

  return data
}

export async function getAllPostsForHome(preview) {
  const query = groq`*[_type == "post"] | order(publishedAt desc){
    ${postFields}
  }`
  const results = await getClient(preview).fetch(query)

  return getUniquePosts(results)
}

/**
 * Helper function to return the correct version of the document
 * If we're in "preview mode" and have multiple documents, return the draft
 */
export function filterDataToSingleItem(data, preview) {
  if (!Array.isArray(data)) {
    return data
  }

  if (data.length === 1) {
    return data[0]
  }

  if (preview) {
    return data.find(item => item._id.startsWith(`drafts.`)) || data[0]
  }

  return data[0]
}

export async function getPostAndMorePosts(slug, preview) {
  const postsQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields}
    body,
    'comments': *[
          _type == "comment" && 
          post._ref == ^._id && 
          approved == true] {
      _id, 
      name, 
      email, 
      comment, 
      _createdAt
    }
  }
  `
  const morePostsQuery = groq`
  *[_type == "post" && slug.current != $slug] | order(publishedAt desc, _updatedAt desc){
    ${postFields}
    body,
  }[0...2]
  `
  const queryParams = { slug }

  const client = getClient(preview)

  const [post, morePosts] = await Promise.all([
    client.fetch(postsQuery, queryParams),
    client.fetch(morePostsQuery, queryParams),
  ])

  return {
    post: filterDataToSingleItem(post, preview),
    morePosts: getUniquePosts(morePosts),
    query: postsQuery,
    queryParams,
  }
}
