import { useMemo, useEffect, useCallback, useState, Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import { ErrorContainer } from './Containers'
import Loading from './Loading'


const DATE_LENGTH = '2025-01-01'.length
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

const TooltipDiv = styled.div`
  border: 1px solid #333;
  background-color: white;
  border-radius: 3px;
  padding: 1px 5px;
  color: #333;
  font-size: 0.8rem;
  box-shadow: 1px 1px 1px rgb(0,0,0,0.25);
`

const TooltipDateContainer = styled.div`
  font-size: 0.65rem;
  color: white;
  background-color: #333;
  display: block;
  margin-top: -1px;
  margin-left: -5px;
  margin-right: -5px;
  padding: 1px 5px;
`

const TooltipDate = styled.span`
  text-transform: uppercase;
  font-weight: bold;
`

const TabContainer = styled.div`
  min-width: 100%;
  overflow-x: scroll;
  display: flex;
  flex-direction: row;
  margin-top: 10px;
`

const Tab = styled.a`
  display: block;
  flex: 1;
  max-width: 200px;
  text-align: center;
  color: black;
  text-decoration: none;
  text-transform: uppercase;
  line-height: 1;
  &:hover {
    color: black;
    text-decoration: none;
  }
  margin: 0 10px;
  padding: 10px 3px;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(to top, #ddd 0, #eee 7px, #eee 100%);
  opacity: 0.9;
  transition: opacity 0.2s
  &:hover {
    opacity: 1;
  }
  &[data-selected="true"] {
    background: white;
    opacity: 1;
  }
`

const TooltipAboveGoal = styled.span`
  font-weight: bold;
  color: green;
`

function TooltipContent({progress, units, active, payload, settings}) {
  if(!active || !payload[0]?.payload) { return null }
  const {day, cumulative, dailyGoal} = payload[0].payload
  const diff = cumulative - dailyGoal
  const GoalDiffWrapper = diff >= 0 ? TooltipAboveGoal : Fragment
  const dates = Object.keys(progress).sort()
  const startDateObj = (settings.startDate && dayjs(settings.startDate)) || dayjs(dates[0])
  return <TooltipDiv>
    <TooltipDateContainer><TooltipDate>{startDateObj.add(day-1, 'd').format('MMMM D, YYYY')}</TooltipDate> (day {day})</TooltipDateContainer>
    {cumulative !== undefined && <div>
      <strong style={{fontSize: '1rem'}}>{cumulative.toLocaleString()} {units}</strong>
      <br />
      <GoalDiffWrapper>
        {diff > 0 && '+'}{diff.toLocaleString(undefined, {maximumFractionDigits: 1})}
      </GoalDiffWrapper> {diff > 0 ? 'above goal' : 'below goal'}
    </div>}
    {dailyGoal && <div><em>Goal: {dailyGoal.toLocaleString(undefined, {maximumFractionDigits: 1})}</em></div>}
  </TooltipDiv>
}
TooltipContent.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  progress: PropTypes.object.isRequired,
  units: PropTypes.string.isRequired,
}

function getOrderOfMagnitude(num) {
  return (num.toFixed(0).toString().length - 1)
}

function formatNumber(n = 0) {
  return n.toLocaleString(undefined, {maximumFractionDigits: 1})
}

function yAxisTickFormatter(value, index) {
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
function XAxisTick({x, y, payload, index, visibleTicksCount, progress, width, settings = {}}) {
  if(x === undefined || y === undefined) { return null }
  const dates = Object.keys(progress).sort()
  const startDateObj = (settings.startDate && dayjs(settings.startDate)) || dayjs(dates[0])
  const endDateObj = (settings.endDate && dayjs(settings.endDate)) || dayjs(dates[dates.length-1])
  if(index === 0) {
    // First day!
    return <>
      <XAxisTickLine x={x} y={y} major={true} />
      <g transform={`translate(${x},${y + 12})`}>
        <text textAnchor='middle' y='1' fontWeight='bold' fontSize='0.9rem'>{startDateObj.format('MMM D')}</text>
        <text textAnchor='middle' y='15' fontWeight='bold' fontSize='0.75rem'>{startDateObj.format('YYYY')}</text>
      </g>
    </>
  }
  if((index+1) === visibleTicksCount) {
    // Last day!
    return <>
      <XAxisTickLine x={x} y={y} major={true} />
      <g transform={`translate(${x},${y + 12})`}>
        <text textAnchor='middle' y='1' fontWeight='bold' fontSize='0.9rem'>{endDateObj.format('MMM D')}</text>
        <text textAnchor='middle' y='15' fontWeight='bold' fontSize='0.75rem'>{endDateObj.format('YYYY')}</text>
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
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  index: PropTypes.number,
  visibleTicksCount: PropTypes.number,
  progress: PropTypes.object,
  width: PropTypes.number,
}

export function ProgressChartSingle({progress, type, units, settings={}}) {
  const [data, largestValue] = useMemo(() => {
    let largestValue = 0
    const dates = Object.keys(progress).sort()
    const startDateObj = (settings.startDate && dayjs(settings.startDate)) || dayjs(dates[0])
    const endDateObj = (settings.endDate && dayjs(settings.endDate)) || dayjs(dates[dates.length-1])
    const numDays = endDateObj.diff(startDateObj, 'd') + 1
    const ret = []
    for(let day = 0; day < numDays; day++) {
      const toPush = { day: day+1 }
      const dayObj = startDateObj.add(day, 'day')
      const dayStr = dayObj.format('YYYY-MM-DD')
      toPush.daily = parseFloat(progress[dayStr]) || 0
      if(day === 0) {
        toPush.cumulative = toPush.daily
      } else {
        toPush.cumulative = toPush.daily + ret[day-1].cumulative
      }
      if(settings.goal) {
        toPush.dailyGoal = settings.goal/numDays * (day+1)
      }
      largestValue = Math.max(largestValue, toPush.cumulative, toPush.daily)
      ret.push(toPush)
    }
    return [ret, largestValue]
  }, [progress])
  const duration = useMemo(() => {
    const dates = Object.keys(progress).sort()
    const startDateObj = (settings.startDate && dayjs(settings.startDate)) || dayjs(dates[0])
    const endDateObj = (settings.endDate && dayjs(settings.endDate)) ||dayjs(dates[dates.length-1])
    return endDateObj.diff(startDateObj, 'd') + 1
  }, [progress])
  const topValue = largestValue
  const orderOfMagnitude = 10 ** getOrderOfMagnitude(topValue)
  const yAxisLimit = Math.max(
    Math.ceil(topValue / orderOfMagnitude) * orderOfMagnitude,
    settings.goal || 0)
  let numYAxisTicks = Math.floor(yAxisLimit / orderOfMagnitude) // Floor should never actually be needed
  if(numYAxisTicks <= 3) {
    const tickWidth = orderOfMagnitude / 2
    numYAxisTicks = Math.floor(yAxisLimit / tickWidth)
  }
  numYAxisTicks = numYAxisTicks + 1
  console.log(data)
  return <ChartContainer>
    <ResponsiveContainer width='100%' height={500} debounce={250}>
      <LineChart data={data} margin={{left: 30, bottom: 20, right: 30, top: 20}}>
        <CartesianGrid stroke="#f6f6f6" />
        <Line
          type="monotone"
          stroke="#8cc66d"
          strokeWidth={1}
          dataKey="dailyGoal"
          dot={{r: 0, fill: '#8cc66d'}}
          activeDot={{r: 3}}
        />
        <Line
          type="monotone"
          stroke="#b83a14"
          strokeWidth={2.5}
          dataKey="cumulative"
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
          tick={<XAxisTick progress={progress} settings={settings} />}
        />
        <YAxis
          domain={[0, yAxisLimit]}
          tickCount={numYAxisTicks}
          allowDecimals={false}
          label={{value: (units || 'words').toUpperCase(), position: 'left', angle: -90, ...axisLabelStyle}}
          tick={{fill: '#333'}}
          tickFormatter={yAxisTickFormatter}
          tickSize={4}
          minTickGap={1}
        />
        <Tooltip
          cursor={false}
          isAnimationActive={false}
          allowEscapeViewBox={{y: true}}
          content={<TooltipContent progress={progress} units={units} settings={settings} />}
          coordinate={{ x: 100, y: 140 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
}
ProgressChartSingle.propTypes = {
  progress: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  units: PropTypes.string.isRequired,
}

export default function ProgressChart({project}) {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [graphIndex, setGraphIndex] = useState(0)
  const fetchProject = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.get(`/project/${project.code}/progress`)
      setData(resp.data?.['hydra:member'] || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [project.code])
  useEffect(() => {
    fetchProject()
  }, [project, fetchProject])
  const [progressData, types] = useMemo(() => {
    const summary = {}
    const typesSet = new Set()
    if(!data) { return [null, null] }
    for(const record of data) {
      typesSet.add(JSON.stringify({type: record.type, units: record.units}))
      const entryType = ((summary[record.type] ??= {})[record.units] ??= {})
      const day = record.entry_date.substring(0, DATE_LENGTH)
      entryType[day] ??= 0
      entryType[day] += Number(record.value)
    }
    const types = Array.from(typesSet).map(el => JSON.parse(el))
    return [summary, types]
  }, [data])
  function makeTabClickHandler(i) {
    return (e) => {
      e.preventDefault()
      setGraphIndex(i)
    }
  }
  return <div>
    {loading && <Loading />}
    {(error && !data) && <ErrorContainer>ERROR: {JSON.stringify(error)}</ErrorContainer>}
    {progressData && types.length > 1 && <TabContainer>
      {types.map((t, i) =>
        <Tab key={i} href='#' onClick={makeTabClickHandler(i)} data-selected={i === graphIndex}>
          <strong>{t.type}</strong><br /><small>{t.units}</small>
        </Tab>
      )}
    </TabContainer>}
    {progressData && <ProgressChartSingle progress={progressData[types[graphIndex].type][types[graphIndex].units]} type={types[graphIndex].type} units={types[graphIndex].units} />}
  </div>
}
ProgressChart.propTypes = {
  //goal: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
}
