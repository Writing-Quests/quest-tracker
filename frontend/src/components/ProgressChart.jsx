import { useMemo } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
`

export default function ProgressChart({goal}) {
  const data = useMemo(() => {
    const ret = []
    for(const i in goal.progress) {
      let value = parseFloat(goal.progress[i]) || 0
      if(i > 0) {
        value += ret[i-1].value
      }
      ret.push({ day: parseInt(i)+1, value })
    }
    return ret
  }, [goal])
  const duration = useMemo(() => {
    const startDateObj = dayjs(goal.start_date)
    const endDateObj = dayjs(goal.end_date)
    return endDateObj.diff(startDateObj, 'd') + 1
  }, [goal])
  return <ChartContainer>
    <ResponsiveContainer width='100%' height={500}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 50 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" stroke="#8884d8" dataKey="value" fillOpacity={1} fill="url(#colorUv)" />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 10" />
        <XAxis type='number' allowDecimals={false} dataKey='day' tickCount={duration} domain={[1, duration]} label={{value: 'Day', position: 'insideBottom', offset: -10}} />
        <YAxis domain={[0, parseFloat(goal.goal)]} tickCount={parseFloat(goal.goal)/10000+1} allowDecimals={false} label={{value: goal.units, position: 'insideLeft', angle: -90, offset: -10}} />
        <Tooltip />
        <ReferenceLine label="Par" stroke="green" strokeDasharray="3 3" segment={[{ x: 1, y: 0 }, { x: duration, y: parseFloat(goal.goal)}]} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
}
ProgressChart.propTypes = {
  goal: PropTypes.object.isRequired,
}
