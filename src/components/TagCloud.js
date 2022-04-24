/**
 * TagCloud.js (c) 2016-2019 @ Cong Min
 * MIT License - https://github.com/mcc108/TagCloud
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Form, Row, Col, InputGroup, Button, Dropdown, DropdownButton } from 'react-bootstrap'

export const useRect = (ref) => {
    const [rect, setRect] = useState({});

    const set = () => setRect(ref && ref.current ? ref.current.getBoundingClientRect() : {});

    const useEffectInEvent = (event, useCapture) => {
      useEffect(() => {
        set();
        window.addEventListener(event, set, useCapture);
        return () => window.removeEventListener(event, set, useCapture);
      }, []);
    };

    useEffectInEvent('resize');
    useEffectInEvent('scroll', true);
  
    return [rect, ref];
};

const getWindowDimensions = (ref) => {
    let parent = ref.current?.parentNode;
    return { width: parent?.offsetWidth || 0, height: parent?.offsetHeight || 0 };
  }

const useWindowDimensions = (ref) => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions(ref));

    useEffect(() => {
        const handleResize = () => {
          setWindowDimensions(getWindowDimensions(ref));
        }

        setWindowDimensions(getWindowDimensions(ref))
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return windowDimensions;
}

const useMousePosition = (ref) => {
    const [mousePosition, setMousePosition] = useState({
        left: 0,
        top: 0,
    });

    const handleMouseMove = (e) => {
        setMousePosition({
            left: e.pageX,
            top: e.pageY,
        })
    }
 
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

//    const callbackRef = useCallback(
//         (node) => {
//             if (ref.current) {
//                 ref.current.removeEventListener("mousemove", handleMouseMove);
//             }

//             ref.current = node;

//             if (ref.current) {
//                 ref.current.addEventListener("mousemove", handleMouseMove);
//             }
//         },
//         [handleMouseMove]
//    );
 
   return [ref, mousePosition];
};

export function TagCloud(props) {

    const ref = useRef()
    const requestRef = React.useRef()
    const previousTimeRef = React.useRef()
    const mouseX0Ref = React.useRef()
    const mouseY0Ref = React.useRef()
    const mousePositionRef = React.useRef({ x: 0, y: 0 })
    const isActive = React.useRef(false)
    const radiusRef = React.useRef(250) // rolling radius, unit `px`
    const depthRef = React.useRef(2 * radiusRef.current)
    const sizeRef = React.useRef(1.5 * radiusRef.current)
    const getMaxSpeed = (name) => ({ slow: 0.5, normal: 1, fast: 2 })[name] || 1;
    const getInitSpeed = (name) => ({ slow: 16, normal: 32, fast: 80 })[name] || 32;
    const maxSpeedRef = React.useRef(getMaxSpeed('normal')) // rolling max speed, optional: `slow`, `normal`(default), `fast`
    const initSpeedRef = React.useRef(getInitSpeed('slow')) // rolling init speed, optional: `slow`, `normal`(default), `fast`
    const directionRef = React.useRef(135) // rolling init direction, unit clockwise `deg`, optional: `0`(top) , `90`(left), `135`(right-bottom)(default)...
    const keepRef = false // whether to keep rolling after mouse out area, optional: `false`, `true`(default)(decelerate to rolling init speed, and keep rolling with mouse)

    const [textItems, setTextItems] = useState([])
    const [mpref, mp] = useMousePosition(ref)
    const [rect, rectref] = useRect(ref)
    const { width, height } = useWindowDimensions(ref)

    useEffect(() => {
        console.log("mouse changed", mp);
        let r = rect
        console.log(r)
        if (r) {
            // this doesn't cause a re-render, but something in next() will
            let x = (mp.left - (r.left + r.width / 2)) / 5
            let y = (mp.top - (r.top + r.height / 2)) / 5;

            mousePositionRef.current = {x, y}
        }

    }, [mp]);

    useEffect(() => {
        console.log("width changed", width)
        radiusRef.current = width / 2 - 20
        console.log("radius changed", radiusRef.current)
        depthRef.current = radiusRef.current * 2
        sizeRef.current = radiusRef.current * 1.5

        // recalculate the text item coordinates
        setTextItems(state.textNodes.map((text, index) => createTextItem(text, index)))
    }, [width])

    const [state, setState] = useState(
        {
            textNodes: ["Lichtbildvorführung", "Pilzberatung", "Volkssturm", "Bergungsraum"],
        }
    )

    const createTextItem = (text, index = 0) => {
        let item = {
            text: text,
            ...computePosition(index), // distributed in appropriate place
        };
        console.log("Create text item ", item)
        return item;
    }

    const next = (mousePosition) => {
        // console.log("update!")

        let mX = mousePosition.x;
        let mY = mousePosition.y;
        // console.log("mouse at", {mX, mY})

        if (!keepRef.current && !isActive.current) {
            console.log("reset mouse")
            // reset distance between the mouse and rolling center x/y axis
            mX = Math.abs(mX - mouseX0Ref.current) < 1 ? mouseX0Ref.current : (mX + mouseX0Ref.current) / 2;
            mY = Math.abs(mY - mouseY0Ref.current) < 1 ? mouseY0Ref.current : (mY + mouseY0Ref.current) / 2; 
        }

        // console.log("mouse for calc: ", {mX, mY})
        const a = -(Math.min(Math.max(-mY, -sizeRef.current), sizeRef.current) / radiusRef.current) * maxSpeedRef.current;
        const b = (Math.min(Math.max(-mX, -sizeRef.current), sizeRef.current) / radiusRef.current) * maxSpeedRef.current;

        if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) {
            //pause
            console.log("pause")
            return;
        }

        // calculate offset
        const l = Math.PI / 180;
        const sc = [
            Math.sin(a * l),
            Math.cos(a * l),
            Math.sin(b * l),
            Math.cos(b * l)
        ];

        // update item positions
        setTextItems(prevTextItems => {
            let textItemsCpy = [...prevTextItems];
            // console.log("update item positions", textItemsCpy)
            textItemsCpy.forEach(item => {
                const rx1 = item.x;
                const ry1 = item.y * sc[1] + item.z * (-sc[0]);
                const rz1 = item.y * sc[0] + item.z * sc[1];

                const rx2 = rx1 * sc[3] + rz1 * sc[2];
                const ry2 = ry1;
                const rz2 = rz1 * sc[3] - rx1 * sc[2];

                const per = 2 * depthRef.current / (2 * depthRef.current + rz2);

                item.x = rx2;
                item.y = ry2;
                item.z = rz2;
                item.scale = per.toFixed(3);
            })
            return textItemsCpy
        })
    }

    const renderTextItem = (item, index = 0) => {
        let style = {}

        style.willChange = 'transform, opacity, filter';
        style.position = 'absolute';
        style.top = '50%';
        style.left = '50%';
        style.zIndex = index + 1;

        const transformOrigin = '50% 50%';
        style.WebkitTransformOrigin = transformOrigin;
        style.MozTransformOrigin = transformOrigin;
        style.OTransformOrigin = transformOrigin;
        style.transformOrigin = transformOrigin;

        if (item.x && item.y && item.z && item.scale) {

            const per = 2 * depthRef.current / (2 * depthRef.current + item.z); // todo
            let alpha = per * per - 0.25;
            alpha = (alpha > 1 ? 1 : alpha).toFixed(3);
    
            const left = (item.x - 50 / 2).toFixed(2);
            const top = (item.y - 20 / 2).toFixed(2);
            const transform = `translate3d(${left}px, ${top}px, 0) scale(${item.scale})`;
            style.WebkitTransform = transform;
            style.MozTransform = transform;
            style.OTransform = transform;
            style.transform = transform;
            style.filter = `alpha(opacity=${100 * alpha})`;
            style.opacity = alpha;
        } else {
            console.log("Item: x: " + item.x + " - y:" + item.y + " - z:" + item.z + " - scale:" + item.scale)
            const transform = 'translate3d(-50%, -50%, 0) scale(1)';
            style.WebkitTransform = transform;
            style.MozTransform = transform;
            style.OTransform = transform;
            style.transform = transform;
            style.filter = 'alpha(opacity=0)';
            style.opacity = 0;
        }

        return <span style={style}>{item.text}</span>
    }

    const renderElements = () => {

        let style = {}
        style.position = 'relative';
        style.width = `${2 * radiusRef.current}px`;
        style.height = `${2 * radiusRef.current}px`;

        // console.log("render elements: " + textItems)

        return <div style={style}>{textItems.map((item, index) => renderTextItem(item, index))}</div>;
    }

    // calculate appropriate place
    const computePosition = (index, random = false) => {
        const textsLength = state.textNodes.length;
        
        // if random `true`, It means that a random appropriate place is generated, and the position will be independent of `index`
        if (random) index = Math.floor(Math.random() * (textsLength + 1));

        const phi = Math.acos(-1 + (2 * index + 1) / textsLength);
        const theta = Math.sqrt((textsLength + 1) * Math.PI) * phi;
        return {
            x: (sizeRef.current * Math.cos(theta) * Math.sin(phi)) / 2,
            y: (sizeRef.current * Math.sin(theta) * Math.sin(phi)) / 2,
            z: (sizeRef.current * Math.cos(phi)) / 2,
            scale: 1
        };
    }
    
    // still a closure since its initiated by useEffect(), we have no current state here
    const animate = time => {
        setTimeout(() => {
            if (previousTimeRef.current != undefined) {
                const deltaTime = time - previousTimeRef.current;
                if (deltaTime > 10) {
                    console.log("next!")
                    next(mousePositionRef.current)
                }
            }
    
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }, 10);
    }

    useEffect(() => {
        console.log("initial effect")
        // create text items with coordinates from the text nodes
        console.log("create text items... ", state.textNodes)
        setTextItems(state.textNodes.map((text, index) => createTextItem(text, index)))

        // init distance between the mouse and rolling center x axis
        let mouseX0 = initSpeedRef.current * Math.sin(directionRef.current * (Math.PI / 180));
        // init distance between the mouse and rolling center y axis
        let mouseY0 = -initSpeedRef.current * Math.cos(directionRef.current * (Math.PI / 180));

        console.log("mouse x: " + mouseX0 + " - mouse y: " + mouseY0)
        mouseX0Ref.current = mouseX0
        mouseY0Ref.current = mouseY0

        // current distance between the mouse and rolling center x/y axis
        console.log("set initial mouse pos ", mouseX0, mouseY0)
        let position = { x: mouseX0, y: mouseY0 }
        mousePositionRef.current = position
        next(position)

        setTimeout(() => {
            requestRef.current = requestAnimationFrame(animate);
        }, 10)

        return () => cancelAnimationFrame(requestRef.current)
    }, [])
    
    const handleMouseOver = (e) => {
        console.log(">> mouse over")
        isActive.current = true
    }

    const handleMouseOut = (e) => {
        console.log("<< mouse out")
        isActive.current = false
    }

    return (
        <Row>
            <Col xs={{span: 12}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 6, offset: 3}}>
                <div ref={ref} onMouseOver={(e) => handleMouseOver(e)} onMouseOut={(e) => handleMouseOut(e)}>
                    {renderElements()}
                    <p>width: {width}</p>
                    <p>x: {mousePositionRef.current.x || 0} | y: {mousePositionRef.current.y || 0}</p>
                </div>
            </Col>
        </Row>
    )
}