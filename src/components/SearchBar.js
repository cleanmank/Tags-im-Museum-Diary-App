import React, { useState, useEffect, useRef } from 'react'
import { Form, Row, Col } from 'react-bootstrap'


export default function DiaryEntry(props) {

    const [state, setState] = useState(
        {
            searchText: ""
        }
    )

    const handleSearchInputChange = (e) => {
        let value = e.target.value;
        console.log(value)
        setState(prevState => { return {...prevState, searchText: value}})

        props.onSearchValueChanged && props.onSearchValueChanged(value)
    }

    return (
        <Row>
            <Col className='mt-3'>
                <Form.Label>Suche</Form.Label>
                <Form.Control type="text" placeholder="Suche nach etwas..." value={state.searchText} onChange={(e) => handleSearchInputChange(e)} />
            </Col>
        </Row>
    )
}
