import React from 'react'
import { transform } from 'buble-jsx-only'
import mdx from '@mdx-js/mdx'
import { MDXProvider, mdx as createElement } from '@mdx-js/react'

const RedH1 = ({ children }) => <h1 style={{ color: 'red' }}>{children}</h1>

const components = {
  h1: RedH1
}

const Home = ({ compiledMdx }) => {
  // See: https://github.com/mdx-js/mdx/blob/732252ebb44949e7b1b6778b5f9aa584582e5dee/packages/runtime/src/index.js#L43-L51
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    '_fn',
    'React',
    'mdx',
    `${compiledMdx}
    return React.createElement(MDXContent, {});`
  )
  const result = fn({}, React, createElement)
  return <MDXProvider components={components}>{result}</MDXProvider>
}

export async function getStaticProps() {
  // You'll fetch this markdown from somewhere
  const markdownString = '# Foo'

  // Precompile MDX on the server side.
  // See: https://github.com/mdx-js/mdx/blob/732252ebb44949e7b1b6778b5f9aa584582e5dee/packages/runtime/src/index.js#L22-L28
  const compiled = await mdx(markdownString, { skipExport: true })

  // Transform JSX to JS so it can be embedded in new Function().
  // See: https://github.com/mdx-js/mdx/blob/732252ebb44949e7b1b6778b5f9aa584582e5dee/packages/runtime/src/index.js#L30-L38
  let compiledMdx
  try {
    compiledMdx = transform(compiled, {
      // Need this to avoid the error:
      // "Mixed JSX attributes ending in spread requires specified
      //  objectAssign option with 'Object.assign' or polyfill helper."
      objectAssign: 'Object.assign'
    }).code
  } catch (err) {
    console.error(err)
    throw err
  }

  return {
    props: {
      compiledMdx
    }
  }
}

export default Home
