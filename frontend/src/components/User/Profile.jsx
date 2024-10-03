import { useContext } from 'react'
import context from '../../services/context'
import Page from '../Page'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const { LoggedInUserContext } = context

//const EXAMPLE_DATA = {
  //progress: [1667, 3002, 3002, 5032, 5038, 7000],
  //goal: 50000,
  //days: 30,
//}

const EXAMPLE_DATA = [
  {day: 1, words: 1667},
  {day: 2, words: 3002},
  {day: 3, words: 3002},
  {day: 4, words: 5032},
  {day: 5, words: 5038},
  {day: 6, words: 7000},
]
const GOAL = 50000
const LENGTH = 30

export default function Profile () {
  const user = useContext(LoggedInUserContext)
  return <Page>
    <p>Welcome {user.username}! Your email address is {user.email}.</p>
    <ResponsiveContainer width={1000} height={500}>
      <AreaChart data={EXAMPLE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" stroke="#8884d8" dataKey="words" fillOpacity={1} fill="url(#colorUv)" />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 10" />
        <XAxis type='number' allowDecimals={false} dataKey='day' tickCount={LENGTH} domain={[1, LENGTH]} label='Day' />
        <YAxis domain={[0, GOAL]} tickCount={GOAL/10000+1} allowDecimals={false} label='Words' />
        <Tooltip />
        <ReferenceLine label="Par" stroke="green" strokeDasharray="3 3" segment={[{ x: 1, y: 0 }, { x: LENGTH, y: GOAL}]} />
      </AreaChart>
    </ResponsiveContainer>
  </Page>
}
