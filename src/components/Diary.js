import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import DiaryEntry from './DiaryEntry'
import SearchBar from './SearchBar';
import SampleData from '../sample_data.json'
import { DateTime } from "luxon"
import { WebClient } from '../web_client'
import { useFlexSearch } from 'react-use-flexsearch'
import { Index } from 'flexsearch'

export default function Diary(props) {

    // const entries = SampleData.diary_entries
    const webClient = new WebClient()

    let { id } = useParams();
    
    const [index, setIndex] = useState(new Index({ tokenize: "full"}));
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (id) {
            webClient.GetDiaryEntries(id).then(
                (entries) => {
                    entries.forEach((entry) => setIndex(index.add(entry.id, entry.content_text)))
                    console.log(index.search("Museum"))
                    console.log(entries)
                    setState(prevState => {
                        return {...prevState, diary_entries: entries.map(entry => { 
                            return {
                                id: entry.id,
                                date: DateTime.fromSQL(entry.date_of_entry.date + " " + entry.date_of_entry.timezone),
                                text: entry.content_text
                            }
                        })}
                    })
                },
                (err) => console.error(err)
            )
        } else {
            webClient.GetDiaries().then(
                (diaries) => {
                    console.log(diaries)
                },
                (err) => console.error(err)
            )
        }
    }, [])

    useEffect(() => {
        console.log("searching...")
        index.searchAsync(query).then(result => {
            setResults(result);
        })
    }, [query]);

    const [state, setState] = useState(
        {
            searchDate: null,
            diary_entries: []
        }
    )

    const handleSearchValueChanged = (value) => {
        setQuery(value)
        //setState(prevState => { return {...prevState, searchText: value}})
    }

    const handleSearchDateChanged = (daterange) => {
        console.log(daterange)
        setState(prevState => { return {...prevState, searchDateRange: daterange}})
    }

    const isOnDate = (date, searchDate) => {
        if (searchDate) {
            let d = DateTime.fromISO(date)
            let dstring = d.toFormat("yyyy-MM-dd")
            let sstring = searchDate.toFormat("yyyy-MM-dd")
            return dstring === sstring
        }

        return true
    }

    const isInMonthOfDate = (date, searchDate) => {
        if (searchDate) {
            let d = DateTime.fromISO(date)
            return d.month === searchDate.month && d.year === searchDate.year
        }

        return true
    }

    const isInYearOfDate = (date, searchDate) => {
        if (searchDate) {
            let d = DateTime.fromISO(date)
            return d.year === searchDate.year
        }

        return true
    }

    const isInDateRange = (date, range) => {
        if (range && range.length === 2) {
            // check if date is between the two dates of range
            let d = DateTime.fromISO(date)
            let start = range[0], end = range[1]

            return d >= start && d <= end
        }

        return true
    }

    const checkIfDateNeedsMarker = (date) => {
        return state.diary_entries.some(entry => isOnDate(entry.date, date))
    }

    const getMonthEntryCount = (date) => {
        return state.diary_entries.filter(entry => isInMonthOfDate(entry.date, date)).length
    }

    const getYearEntryCount = (date) => {
        return state.diary_entries.filter(entry => isInYearOfDate(entry.date, date)).length
    }

    const renderEntries = () => {
        const isInText = (text, searchValue) => {
            if (searchValue)
                return text.includes(searchValue)

            return true
        }

        return state.diary_entries.filter(entry => isInText(entry.text, state.searchText) && isInDateRange(entry.date, state.searchDateRange)).map(entry => 
            <Row>
                <Col className='mt-3'>
                    <DiaryEntry date={entry.date} text={entry.text} mark={state.searchText} />
                </Col>
            </Row>
        )
    }

    const renderResults = () => {
        console.log(results)
        return state.diary_entries.filter(entry => results.some(res => res == entry.id)).map(entry =>             
            <Row>
                <Col className='mt-3'>
                    <DiaryEntry date={entry.date} text={entry.text} mark={query} />
                </Col>
            </Row>
        )
    }

    return <>
        <SearchBar onSearchValueChanged={(value) => handleSearchValueChanged(value)} 
            onSearchDateChanged={(daterange) => handleSearchDateChanged(daterange)}
            dateNeedsMarker={(date) => checkIfDateNeedsMarker(date)}
            getMonthEntryCount={(date) => getMonthEntryCount(date)}
            getYearEntryCount={(date) => getYearEntryCount(date)} />
        {/* {renderEntries()} */}
        {renderResults()}
    </>
}
