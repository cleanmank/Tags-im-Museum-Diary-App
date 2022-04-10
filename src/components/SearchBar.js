import React, { useState, useEffect, useRef } from 'react'
import { Form, Row, Col, InputGroup, Button, Dropdown, DropdownButton } from 'react-bootstrap'
import Calendar from 'react-calendar'
import { DateTime } from "luxon";

export default function DiaryEntry(props) {
    
    const minDate = DateTime.fromFormat("1932-09-01", "yyyy-MM-dd")
    const maxDate = DateTime.fromFormat("1946-07-31", "yyyy-MM-dd")

    const [state, setState] = useState(
        {
            selectedDateRange: [minDate.plus({ day: 1 }), minDate.plus({ days: 5 })]
        }
    )

    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            props.onSearchValueChanged && props.onSearchValueChanged(searchTerm)
        }, 500)
    
        return () => clearTimeout(delayDebounceFn)
      }, [searchTerm])

    const handleSearchInputChange = (e) => {
        let value = e.target.value;
        console.log(value)
        setSearchTerm(value)
        // setState(prevState => { return {...prevState, searchText: value}})
    }

    const handleDateInputChange = (daterange) => {
        // handle selected date, if it's an array -> date range
        let currRange = daterange.map(date => DateTime.fromJSDate(date))
        setState(prevState => { return {...prevState, selectedDateRange: currRange}})

        props.onSearchDateChanged && props.onSearchDateChanged(currRange)
    }

    const handleCancelDateSelection = (e) => {
        setState(prevState => { return {...prevState, selectedDateRange: null}})

        props.onSearchDateChanged && props.onSearchDateChanged(null)
    }

    const getDayTileMarker = (date) => {
        if (props.dateNeedsMarker && props.dateNeedsMarker(DateTime.fromJSDate(date))){
            return <div className="date-marker"></div>
        }

        return <div className="date-marker invisible"></div>;
    }

    const getMonthTileMarker = (date) => {
        // month tile is represented by the 1th of the month as date
        // TODO: get count of dates that are to be marked in a month
        console.log(date)
        if (props.getMonthEntryCount) {
            let count = props.getMonthEntryCount(DateTime.fromJSDate(date))
            return <div className="">{count}</div>
        }
        return null;
    }

    const getYearTileMarker = (date) => {
        if (props.getYearEntryCount) {
            let count = props.getYearEntryCount(DateTime.fromJSDate(date))
            return <div><small>{count}</small></div>
        }
        return null
    }

    const getDecadeTileMarker = (date) => {
        return null
    }

    const getCalendarTileContent = (activeStartDate, date, view) => {
        switch (view) {
            case "month":
                return getDayTileMarker(date)
                
            case "year":
                return getMonthTileMarker(date)
            
            case "decade":
                return getYearTileMarker(date)

            case "century":
                return getDecadeTileMarker(date)
            default:
                console.log(view)
                break;
        }
    }

    return (
        <Row>
            <Col className='mt-3'>
                <Form.Label>Suche</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control
                    placeholder="Suche nach etwas..."
                    aria-label="Suche nach etwas..."
                    aria-describedby="basic-addon2"
                    onChange={(e) => handleSearchInputChange(e)}
                    value={searchTerm}
                    />
                    <DropdownButton
                        variant="outline-secondary"
                        title={state.selectedDateRange ? state.selectedDateRange.map(date => date.toFormat("dd.MM.yyyy")).join(" - ") : "Datum auswählen"}
                        id="input-group-dropdown-1">
                            <div className='p-3'>
                                <Calendar
                                    selectRange={true}
                                    onChange={(e) => handleDateInputChange(e)}
                                    value={state.selectedDateRange ? state.selectedDateRange.map(date => date.toJSDate()) : null}
                                    minDate={minDate.toJSDate()}
                                    maxDate={maxDate.toJSDate()}
                                    tileContent={({ activeStartDate, date, view }) => getCalendarTileContent(activeStartDate, date, view)}
                                />
                                <Button variant="outline-secondary" className='w-100 mt-2' onClick={(e) => handleCancelDateSelection(e)}>Cancel Selection</Button>
                            </div>
                    </DropdownButton>
                </InputGroup>
            </Col>
        </Row>
    )
}
