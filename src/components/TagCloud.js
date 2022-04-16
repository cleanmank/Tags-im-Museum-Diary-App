/**
 * TagCloud.js (c) 2016-2019 @ Cong Min
 * MIT License - https://github.com/mcc108/TagCloud
 */

 import React, { useState, useEffect, useRef, useCallback } from 'react'
 import { Form, Row, Col, InputGroup, Button, Dropdown, DropdownButton } from 'react-bootstrap'

 const useMousePosition = () => {
   const [mousePosition, setMousePosition] = useState({
     left: 0,
     top: 0,
   });
 
   const handleMouseMove = useCallback(
     (e) =>
       setMousePosition({
         left: e.pageX,
         top: e.pageY,
       }),
     []
   );
 
   const ref = useRef();
 
   const callbackRef = useCallback(
        (node) => {
            if (ref.current) {
                ref.current.removeEventListener("mousemove", handleMouseMove);
            }

            ref.current = node;

            if (ref.current) {
                ref.current.addEventListener("mousemove", handleMouseMove);
            }
        },
        [handleMouseMove]
   );
 
   return [callbackRef, mousePosition];
 };

 export function TagCloud(props) {

    const requestRef = React.useRef()
    const previousTimeRef = React.useRef()
    const mouseX0Ref = React.useRef()
    const mouseY0Ref = React.useRef()
    const mousePosition = React.useRef({ x: 0, y: 0 })
    const isActive = React.useRef(false)

    const getMaxSpeed = (name) => ({ slow: 0.5, normal: 1, fast: 2 })[name] || 1;
    const getInitSpeed = (name) => ({ slow: 16, normal: 32, fast: 80 })[name] || 32;

    const [textItems, setTextItems] = useState([])
    const [ref, mp] = useMousePosition()

    // const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    useEffect(() => {
        console.log("mouse changed", mp);

        // this doesn't cause a re-render, but something in next() will
        let position = {x: mp.left, y: mp.top}
        mousePosition.current = position
        // next(position)
    }, [mp]);

    const [radius, setRadius] = useState(250)

    const [state, setState] = useState(
        {
            textNodes: ["test1", "test2", "test3", "test4"],
            depth: 2 * radius,
            size: 1.5 * radius,
            maxSpeed: getMaxSpeed('slow'), // rolling max speed, optional: `slow`, `normal`(default), `fast`
            initSpeed: getInitSpeed('slow'), // rolling init speed, optional: `slow`, `normal`(default), `fast`
            direction: 0, // rolling init direction, unit clockwise `deg`, optional: `0`(top) , `90`(left), `135`(right-bottom)(default)...
            keep: false, // whether to keep rolling after mouse out area, optional: `false`, `true`(default)(decelerate to rolling init speed, and keep rolling with mouse)
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

    const requestInterval = (fn, delay) => {
        const requestAnimFrame = ((() => window.requestAnimationFrame) || ((callback, element) => {
            window.setTimeout(callback, 1000 / 60);
        }))();

        let start = new Date().getTime();
        const handle = {};
        const loop = () => {
            handle.value = requestAnimFrame(loop)
            const current = new Date().getTime()
            const delta = current - start

            if (delta >= delay) {
                fn.call();
                start = new Date().getTime();
            }
        }
        handle.value = requestAnimFrame(loop);
        return handle;
    }

    const next = (mousePosition) => {
        // console.log("update!")

        let mX = mousePosition.x;
        let mY = mousePosition.y;
        console.log("mouse at", {mX, mY})

        if (!state.keep && !isActive.current) {
            console.log("reset mouse")
            // reset distance between the mouse and rolling center x/y axis
            mX = Math.abs(mX - mouseX0Ref.current) < 1 ? mouseX0Ref.current : (mX + mouseX0Ref.current) / 2;
            mY = Math.abs(mY - mouseY0Ref.current) < 1 ? mouseY0Ref.current : (mY + mouseY0Ref.current) / 2; 
        }

        console.log("mouse for calc: ", {mX, mY})
        const a = -(Math.min(Math.max(-mY, -state.size), state.size) / radius) * state.maxSpeed;
        const b = (Math.min(Math.max(-mX, -state.size), state.size) / radius) * state.maxSpeed;

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
            console.log("update item positions", textItemsCpy)
            textItemsCpy.forEach(item => {
                const rx1 = item.x;
                const ry1 = item.y * sc[1] + item.z * (-sc[0]);
                const rz1 = item.y * sc[0] + item.z * sc[1];

                const rx2 = rx1 * sc[3] + rz1 * sc[2];
                const ry2 = ry1;
                const rz2 = rz1 * sc[3] - rx1 * sc[2];

                const per = (2 * state.depth) / (2 * state.depth + rz2);

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

            const per = (2 * state.depth) / (2 * state.depth + item.z); // todo
            let alpha = per * per - 0.25;
            alpha = (alpha > 1 ? 1 : alpha).toFixed(3);
    
            const left = (item.x - 100 / 2).toFixed(2);
            const top = (item.y - 50 / 2).toFixed(2);
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
        style.width = `${2 * radius}px`;
        style.height = `${2 * radius}px`;

        console.log("render elements: " + textItems)

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
            x: (state.size * Math.cos(theta) * Math.sin(phi)) / 2,
            y: (state.size * Math.sin(theta) * Math.sin(phi)) / 2,
            z: (state.size * Math.cos(phi)) / 2,
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
                    next(mousePosition.current)
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
        let mouseX0 = state.initSpeed * Math.sin(state.direction * (Math.PI / 180));
        // init distance between the mouse and rolling center y axis
        let mouseY0 = -state.initSpeed * Math.cos(state.direction * (Math.PI / 180));
        console.log("mouse x: " + mouseX0 + " - mouse y: " + mouseY0)
        mouseX0Ref.current = mouseX0
        mouseY0Ref.current = mouseY0

        // current distance between the mouse and rolling center x/y axis
        console.log("set initial mouse pos ", mouseX0, mouseY0)
        let position = { x: mouseX0, y: mouseY0 }
        mousePosition.current = position
        next(position)

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current)
    }, [])
 
     return (
        <div ref={ref} onMouseOver={(e) => isActive.current = true} onMouseOut={(e) => isActive.current = false}>
            <h1>test</h1>
            {renderElements()}
            <p>x: {mousePosition.current.x || 0} | y: {mousePosition.current.y || 0}</p>
        </div>
     )
 }