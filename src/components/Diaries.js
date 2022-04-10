import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import DiaryEntry from './DiaryEntry'
import SearchBar from './SearchBar';
import SampleData from '../sample_data.json'
import { DateTime } from "luxon";
import { WebClient } from '../web_client';

export default function Diaries() {

    const webClient = new WebClient()

    useEffect(() => {
        webClient.GetDiaries().then(
            (diaries) => {
                console.log(diaries)
                setState(prevState => { return {...prevState, diaries: diaries}})
            },
            (err) => console.error(err)
        )
    }, [])

    const [state, setState] = useState(
        {
            diaries: []
        }
    )

    const renderDiaries = () => {
        return state.diaries.map(diary => {
            let from = DateTime.fromSQL(diary.from_date.date + " " + diary.from_date.timezone)
            let to = DateTime.fromSQL(diary.to_date.date + " " + diary.to_date.timezone)

            return (
                <Row key={diary.id}>
                    <Col className='mt-3'>
                        <Link to={"/diaries/" + diary.id}>
                            <Card className="text-decoration-none text-regular">
                                <Card.Body>
                                    <p className='mb-2'><small>{diary.number}</small></p>
                                    <h6>{diary.title}</h6>
                                    <p>{from.toFormat("dd.MM.yyyy")} - {to.toFormat("dd.MM.yyyy")}</p>
                                    <p className='mb-0'>{diary.author_ids.map(author => (author.title ? author.title + " " : "") + author.firstname + " " + author.lastname).join(", ")}</p>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                </Row>
            )
            })
    }

    return <>
        {renderDiaries()}
    </>
}
