import React from 'react'
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  createContainer,
  LineSegment,
  VictoryLegend
} from 'victory'
import axios from 'axios'
import moment from 'moment'
import { Flex, Heading, Text, theme } from 'ooni-components'
import { FormattedMessage } from 'react-intl'

import SpinLoader from '../vendor/spin-loader'
import Tooltip from '../country/tooltip'
import FormattedMarkdown from '../formatted-markdown'
import VictoryTheme from '../VictoryTheme'
import { ChartLoader } from './ChartLoader'

const getMaxima = (data) => {
  let maxima
  data.forEach((d) => {
    if (typeof maxima === 'undefined'
        || maxima < d.value) {
      maxima = d.value
    }
  })
  return maxima
}

class CoverageChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      countryCoverage: null,
      networkCoverage: null,
      measurementsByMonth: null,
      fetching: true
    }
  }
  componentDidMount() {
    this.fetchCoverageStats()
  }

  async fetchCoverageStats () {
    const client = axios.create({baseURL: process.env.MEASUREMENTS_URL}) // eslint-disable-line
    const result = await client.get('/api/_/global_overview_by_month')

    this.setState({
      countryCoverage: result.data.countries_by_month,
      networkCoverage: result.data.networks_by_month,
      measurementsByMonth: result.data.measurements_by_month,
      fetching: false
    })
  }

  render() {
    const { countryCoverage, networkCoverage, measurementsByMonth, fetching } = this.state
    if (fetching) {
      return (<ChartLoader />)
    }

    // API responses are ordered by date, with most recent month at the end
    const lastMonth = {
      countryCount: countryCoverage[countryCoverage.length - 1].value,
      networkCount: networkCoverage[networkCoverage.length - 1].value,
      measurementCount: measurementsByMonth[measurementsByMonth.length - 1].value
    }

    // Determine the maximum value for each data set
    // Used to scale the charts on a y-axis shared with other charts
    const countryCoverageMaxima = getMaxima(countryCoverage)
    const networkCoverageMaxima = getMaxima(networkCoverage)
    const measurementMaxima = getMaxima(measurementsByMonth)

    const VictoryCursorVoronoiContainer = createContainer('cursor', 'voronoi')

    return (
      <React.Fragment>
        <Flex justifyContent='center'>
          <Text fontSize={18}>
            <FormattedMarkdown id={'Home.MonthlyStats.SummaryText'}
              values={{
                measurementCount: lastMonth.measurementCount,
                networkCount: lastMonth.networkCount,
                countryCount: lastMonth.countryCount
              }}
            />
          </Text>
        </Flex>
        <VictoryChart
          height={250}
          width={800}
          theme={VictoryTheme}
          containerComponent={
            <VictoryCursorVoronoiContainer
              cursorComponent={
                <LineSegment
                  style={{ strokeDasharray: [6, 6], stroke: theme.colors.gray5}}
                />
              }
              voronoiDimension='x'
              labels={(d) => {
                if (d.childName === 'countryCoverage') {
                  return `${d.date}\n \nCountries: ${d.value}`
                } else if (d.childName === 'networkCoverage') {
                  return `Networks: ${d.value}`
                } else if (d.childName === 'measurementsByMonth') {
                  return `Measurements: ${d.value}`
                }
              }}
              labelComponent={<Tooltip />}
            />
          }
          domainPadding={{
            x: 0, y: 10
          }}
        >
          <VictoryLegend
            centerTitle
            x={230}
            y={230}
            orientation='horizontal'
            gutter={40}
            data={[
              { name: 'Countries',
                symbol: {
                  type: 'minus', fill: theme.colors.blue8
                }
              },
              {
                name: 'Networks',
                symbol: {
                  type: 'minus', fill: theme.colors.gray7
                }
              },
              {
                name: 'Monthly Measurements',
                symbol: {
                  type: 'minus', fill: theme.colors.yellow7
                }
              }
            ]}
          />
          <VictoryAxis
            tickCount={12}
            tickFormat={(t) => moment(t).format('MMM[\']YY')}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: {
                stroke : theme.colors.blue7,
                strokeWidth: 2
              }
            }}
            tickValues={[0, 0.5, 1]}
            tickFormat={(t) => Math.floor(t * countryCoverageMaxima)}
          />
          <VictoryLine
            name='countryCoverage'
            data={countryCoverage}
            x='date'
            y={(d) => d.value / countryCoverageMaxima}
            scale={{ x: 'time', y: 'linear' }}
            style={{
              data: {
                stroke: theme.colors.blue8
              }
            }}
          />
          <VictoryAxis
            dependentAxis
            offsetX={400}
            style={{
              axis: {
                stroke : theme.colors.gray7,
                strokeWidth: 2
              }
            }}
            tickValues={[0, 0.5, 1]}
            // Hide tick value 0 for the axis in the middle of the chart
            tickFormat={(t) => t > 0 ? Math.floor(t * networkCoverageMaxima) : ''}
          />
          <VictoryLine
            name='networkCoverage'
            data={networkCoverage}
            x='date'
            y={(d) => (d.value + 20) / networkCoverageMaxima}
            scale={{ x: 'time', y: 'linear' }}
            style={{
              data: {
                stroke: theme.colors.gray7
              }
            }}
          />
          <VictoryAxis
            dependentAxis
            orientation='right'
            style={{
              axis: {
                stroke : theme.colors.yellow7,
                strokeWidth: 2
              }
            }}
            tickValues={[0, 0.5, 1]}
            tickFormat={(t) => `${Math.round(t * measurementMaxima/1000, 2)}k`}
          />
          <VictoryLine
            name='measurementsByMonth'
            data={measurementsByMonth}
            x='date'
            y={(d) => (d.value + 20) / measurementMaxima}
            scale={{ x: 'time', y: 'linear' }}
            style={{
              data: {
                stroke: theme.colors.yellow7
              }
            }}
          />
        </VictoryChart>
      </React.Fragment>
    )
  }
}

export { CoverageChart }
