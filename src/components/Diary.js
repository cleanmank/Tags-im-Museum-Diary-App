import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import DiaryEntry from './DiaryEntry'
import SearchBar from './SearchBar';
import SampleData from '../sample_data.json'

export default function Diary() {

    const entries = SampleData.diary_entries

    const [state, setState] = useState(
        {
            searchText: "",
            diary_entries: entries
        }
    )

    const handleSearchValueChanged = (value) => {
        setState(prevState => { return {...prevState, searchText: value}})
    }

    const renderEntries = () => {
        return state.diary_entries.filter(entry => entry.text.includes(state.searchText)).map(entry => 
            <Row>
                <Col className='mt-3'>
                    <DiaryEntry date={entry.date} text={entry.text} mark={state.searchText} />
                </Col>
            </Row>
        )
    }

    return <>
        <SearchBar onSearchValueChanged={(value) => handleSearchValueChanged(value)}/>
        {renderEntries()}
    </>
}
