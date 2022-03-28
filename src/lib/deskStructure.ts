import S from '@sanity/desk-tool/structure-builder'
import Iframe from 'sanity-plugin-iframe-pane'

import resolveProductionUrl from './resolveProductionUrl'

export const getDefaultDocumentNode = () => {
  return S.document().views([
    S.view.form(),
    S.view
      .component(Iframe)
      .options({
        url: doc => resolveProductionUrl(doc),
      })
      .title('Preview'),
  ])
}

// Filtering of the items showing up in the named list
// Currently we're just returning all document types
// To list a single item use `S.documentTypeListItem('typeName')`
export const getItems = () =>
  S.list()
    .title('Content')
    .items([...S.documentTypeListItems()])

export default getItems
