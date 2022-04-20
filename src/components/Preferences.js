import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Form, ButtonGroup, Button, ToggleButton } from 'react-bootstrap'
import { DateTime } from "luxon";

export default function Preferences(props) {
    
    const [fontStyle, setFontStyle] = useState(props.preferences?.fontStyle || "normal")

    useEffect(() => {
        props.onPreferencesChanged && props.onPreferencesChanged({
            fontStyle: fontStyle
        })
    }, [fontStyle])

    const radios = [
      { name: 'normal' },
      { name: 'fraktur' }
    ];

    return (
        <>
            <Row>
                <Col className='mt-3'>
                    <h2>Einstellungen</h2>
                </Col>
            </Row>
            <Row>
                <Col className=''>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className='d-block'>Schriftart</Form.Label>
                        <ButtonGroup aria-label="Font style">
                            {radios.map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant="secondary"
                                    name="radio"
                                    value={radio.name.toLowerCase()}
                                    className={radio.name === "fraktur" ? "font-fraktur" : "font-normal"}
                                    checked={fontStyle.toLowerCase() === radio.name.toLowerCase()}
                                    onChange={(e) => setFontStyle(e.currentTarget.value)}>
                                {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </Form.Group>
                </Col>
            </Row>
        </>
    )
}
