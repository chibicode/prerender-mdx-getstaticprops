import React from 'react'
import { transform } from 'buble-jsx-only'
import mdx from '@mdx-js/mdx'
import { MDXProvider, mdx as createElement } from '@mdx-js/react'

const RedH1 = ({ children }) => <h1 style={{ color: 'red' }}>{children}</h1>

const components = {
  h1: RedH1
}

const Home = ({ compiledMdx }) => {
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

  // Precompile MDX on the server side
  const compiled = await mdx(markdownString, { skipExport: true })

  // Transform JSX to JS so it can be embedded in new Function()
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
