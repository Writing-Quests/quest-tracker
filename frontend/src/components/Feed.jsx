/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useMemo, createContext } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import api from '../services/api'
import Input, { Button } from './Forms/Input'
import Loading from './Loading'
import { ErrorContainer, ContentContainer, ContentBlock, AnimatedContainer, SuccessContainer } from './Containers'

const { LoggedInUserContext } = context


export default function HomeFeed() {
  const user = useContext(LoggedInUserContext)
  const [following,setFollowing] = useState([])
  const [buddies,setBuddies] = useState([])
  const [loading, setLoading] = useState(true)
  console.log(user)
  
    useEffect(() => {
    async function getConnections () {
      const resp = await api.get("/connection/feed");
      console.log(resp)
      setFollowing(resp.data.following)
      setBuddies(resp.data.mutuals)
    }
    getConnections()
  },[user])

  return (
    <Page>
      <ContentContainer>
        <ContentBlock>
          <h1>Buddy List</h1>
            {JSON.stringify(buddies)}
          <h1>Following</h1>
          {JSON.stringify(following)}
        </ContentBlock>
      </ContentContainer>
    </Page>
  )
}