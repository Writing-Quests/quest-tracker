import { useMemo } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const DAYS_PER_WEEK = 7

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
`

const axisLabelStyle = {
  fill: '#333',
  fontWeight: 'bold',
  fontSize: '0.9rem',
}

function getOrderOfMagnitude(num) {
  return (num.toFixed(0).toString().length - 1)
}

function formatNumber(n = 0) {
  return n.toLocaleString(undefined, {maximumFractionDigits: 1})
}

function yAxisTickFormatter(goal, value, index) {
  if(index === 0) { return '' }
  const orderOfMagnitude = getOrderOfMagnitude(value)
  switch(orderOfMagnitude) {
    case 0:
    case 1:
    case 2:
      return formatNumber(value)
    case 3:
    case 4:
    case 5:
      return formatNumber(value/(1000)) + 'k'
    case 6:
    case 7:
    case 8:
      return formatNumber(value/(1000000)) + 'M'
    default:
      return formatNumber(value/(1000000000)) + 'B'
  }
}

function XAxisTickLine({x, y, major}) {
  return <path d={`M ${x},${y-5.5} l 0,${major ? '5' : '2'} `} stroke='#333' strokeWidth={major ? '2' : '0.5'} />
}
XAxisTickLine.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  major: PropTypes.bool,
}

// We want at least 60px per tick
const WIDTH_PER_TICK = 60
function XAxisTick({x, y, payload, index, visibleTicksCount, goal, width}) {
  if(index === 0) {
    // First day!
    return <>
      <XAxisTickLine x={x} y={y} major={true} />
      <g transform={`translate(${x},${y + 12})`}>
        <text textAnchor='middle' y='1' fontWeight='bold' fontSize='0.9rem'>{dayjs(goal.start_date).format('MMM D')}</text>
        <text textAnchor='middle' y='15' fontWeight='bold' fontSize='0.75rem'>{dayjs(goal.start_date).format('YYYY')}</text>
      </g>
    </>
  }
  if((index+1) === visibleTicksCount) {
    // Last day!
    return <>
      <XAxisTickLine x={x} y={y} major={true} />
      <g transform={`translate(${x},${y + 12})`}>
        <text textAnchor='middle' y='1' fontWeight='bold' fontSize='0.9rem'>{dayjs(goal.end_date).format('MMM D')}</text>
        <text textAnchor='middle' y='15' fontWeight='bold' fontSize='0.75rem'>{dayjs(goal.end_date).format('YYYY')}</text>
      </g>
    </>
  }
  const isWeekStart = payload.value % DAYS_PER_WEEK === 0
  const weekNum = payload.value / DAYS_PER_WEEK + 1
  const numWeekTicks = Math.floor(visibleTicksCount / DAYS_PER_WEEK)
  const maxTicks = width / WIDTH_PER_TICK
  const displayRatio = Math.floor(numWeekTicks / maxTicks) + 1
  const displayOffset = Math.ceil(displayRatio/2) // Ceil takes care of edge case where ratio is 1
  const widthPerWeek = width / numWeekTicks / displayRatio
  const displayText =
    isWeekStart // Only display at the start of the week
    && !((weekNum + displayOffset) % displayRatio) // Only display text for every diaplsyRatio ticks (ensures they don't get spaced too closely). The offset helps make sure there's nothing too close to the starting line
    && (x + widthPerWeek - 80) < width // Make sure major ticks don't get output right next to the end (this 80 is a magic number that works about right)
  return <>
    <XAxisTickLine x={x} y={y} major={isWeekStart} />
    {displayText && <g transform={`translate(${x},${y + 12})`}>
      <text textAnchor='start' fontSize='0.8rem' color='#333'>Week</text>
      <text y='15' textAnchor='start' color='#333' fontWeight='bold'>{weekNum}</text>
    </g>}
  </>
}
XAxisTick.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  payload: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  visibleTicksCount: PropTypes.number.isRequired,
  goal: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,

}

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
  const topValue = Math.max(parseFloat(goal.goal), data[data.length-1].value)
  const orderOfMagnitude = 10 ** getOrderOfMagnitude(topValue)
  const yAxisLimit = Math.ceil(topValue / orderOfMagnitude) * orderOfMagnitude
  let numYAxisTicks = Math.floor(yAxisLimit / orderOfMagnitude) // Floor should never actually be needed
  if(numYAxisTicks <= 2) {
    const tickWidth = orderOfMagnitude / 2
    numYAxisTicks = Math.floor(yAxisLimit / tickWidth)
  }
  numYAxisTicks = numYAxisTicks + 1
  return <ChartContainer>
    <ResponsiveContainer width='100%' height={500} debounce={250}>
      <LineChart data={data} margin={{left: 30, bottom: 20, right: 30, top: 20}}>
        <CartesianGrid stroke="#f6f6f6" />
        <Line
          type="monotone"
          stroke="#b83a14"
          strokeWidth={2}
          dataKey="value"
          dot={{r: 1, fill: '#b83a14'}}
          activeDot={{r: 5}}
        />
        <XAxis
          type='number'
          allowDecimals={false}
          dataKey='day'
          tickCount={duration}
          tickLine={false}
          domain={[1, duration]}
          interval={0}
          tickSize={4}
          tick={<XAxisTick goal={goal} />}
        />
        <YAxis
          domain={[0, yAxisLimit]}
          tickCount={numYAxisTicks}
          allowDecimals={false}
          label={{value: (goal.units || 'words').toUpperCase(), position: 'left', angle: -90, ...axisLabelStyle}}
          tick={{fill: '#333'}}
          tickFormatter={yAxisTickFormatter.bind(this, goal)}
          tickSize={4}
          minTickGap={1}
        />
        <Tooltip
          cursor={false}
          animationDuration={100}
        />
        <ReferenceLine
          label="Par"
          stroke="green"
          strokeDasharray="3 3"
          segment={[{ x: 1, y: 0 }, { x: duration, y: parseFloat(goal.goal)}]}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
}
ProgressChart.propTypes = {
  goal: PropTypes.object.isRequired,
}
