import Footer from './footer'
import Meta from './meta'
import Alert from './alert'

export default function Layout({ children, preview }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        {preview && <Alert preview={preview} />}

        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}
