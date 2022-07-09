import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { GetStaticProps } from 'next'
import { useState } from 'react'
import jwt from 'jsonwebtoken'

export default function Home({
  
  allPostsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[]
}) {

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const [message, setMessage] = useState<string>('You are not logged in')
  const [secret, setSecret] = useState<string>('')
  
  async function submitForm() {
    const res = await fetch('api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    }).then(t => t.json())

    const token = res.token

    if(token){
      const json = jwt.decode(token) as { [key: string]: string }
      setMessage(
        `Welcome ${json.username} and you are ${json.admin ? 'an admin!' : 'not an admin'}`
      )

      const res = await fetch('api/secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      }).then(t => t.json())

      if(res.secretAdminCode) {
        setSecret(res.secretAdminCode)
      } else {
        setSecret('Nothing Available')
      }

    } else {
      setMessage('Something went wrong.')
    }
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>[Your Self Introduction]</p>
        <p>
          (This is a sample website - you’ll be building a site like this in{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section><br />
      <div>
        <h1>{message}</h1><br />
        <h1>Secret: {secret} </h1>
        <form>
          <input type="text" 
          name= "username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          />
           <br />
           <input 
           type="password" 
           name="password" 
           value={password} 
           onChange={(e) => setPassword(e.target.value)}
           />
           <br />
           <input type="button" value="Login" onClick={submitForm} />
        </form>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}