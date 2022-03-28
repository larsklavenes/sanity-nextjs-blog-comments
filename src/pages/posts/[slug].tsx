import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import MoreStories from '../../components/more-stories'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Comments from '../../components/comments'
import SectionSeparator from '../../components/section-separator'
import Layout from '../../components/layout'
import {
  getAllPostsWithSlug,
  getPostAndMorePosts,
  filterDataToSingleItem,
} from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import Form from '../../components/form'
import { usePreviewSubscription } from '../../lib/sanity'

export default function Post({ data, preview }) {
  const { data: previewData } = usePreviewSubscription(data?.query, {
    params: data?.queryParams ?? {},
    // The hook will return this on first render
    // This is why it's important to fetch *draft* content server-side!
    initialData: data?.post,
    // The passed-down preview context determines whether this function does anything
    enabled: preview,
  })

  // // Client-side uses the same query, so we may need to filter it down again
  const post = filterDataToSingleItem(previewData, preview)

  // console.log(data, preview)

  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout preview={preview}>
      <Container>
        <Header />

        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>{post?.seo.seo_title}</title>
                <meta name="description" content={post?.seo.meta_description} />
                <meta name="keywords" content={post?.seo.focus_keyword} />
                {/* <meta property="og:image" content={post.ogImage.url} /> */}
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
                slug={post.slug}
              />
              <PostBody content={post.body} />
            </article>

            <Comments comments={post.comments} />
            <Form _id={post._id} />

            <SectionSeparator />
            {data?.morePosts.length > 0 && (
              <MoreStories posts={data.morePosts} />
            )}
          </>
        )}
      </Container>
    </Layout>
  )
}

/**
 * Fetch the data from Sanity based on the current slug
 *
 * Important: You _could_ query for just one document, like this:
 * *[slug.current == $slug][0]
 * But that won't return a draft document!
 * And you get a better editing experience
 * fetching draft/preview content server-side
 *
 * Also: Ignore the `preview = false` param!
 * It's set by Next.js "Preview Mode"
 * It does not need to be set or changed here
 */
export async function getStaticProps({ params, preview = false }) {
  const { post, morePosts, query, queryParams } = await getPostAndMorePosts(
    params.slug,
    preview
  )

  // Escape hatch, if our query failed to return data
  if (!post) return { notFound: true }

  return {
    props: {
      preview,
      data: {
        post,
        morePosts,
        query: preview ? query : null,
        queryParams: preview ? queryParams : null,
      },
    },
  }
}

export async function getStaticPaths() {
  const paths = await getAllPostsWithSlug()

  return {
    paths: paths.map(slug => `/posts/${slug}`),
    fallback: true,
  }
}
