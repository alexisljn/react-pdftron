import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";
import DraggableField from "./DraggableField";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);

    const [targets, setTargets] = useState([]);
    const [signatureCounter, setSignatureCounter] = useState(1);
    const [emailCounter, setEmailCounter] = useState(1);
    const [nameCounter, setNameCounter] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // const [target, setTarget] = React.useState();
    const [frame, setFrame] = React.useState({
        translate: [0,0],
    });

    const SIGNATURE_TYPE = 'signature';
    const EMAIL_TYPE = 'email';
    const NAME_TYPE = 'name';

    useEffect(() => {
        // setTarget(document.querySelector(".target"));

        const loadWebViewer = async () => {
            const instance = await WebViewer(
                {
                    licenseKey: 'toto',
                    path: '/pdftron/lib',
                    initialDoc: '/fixture/sample.pdf',
                },
                viewer.current,
            )
            setWebViewer(instance)
            handleClick(instance)
        }


        console.log("SIG COUNTER", signatureCounter);

       // initiate
       //  const signatureDOMTarget = createDOMTarget('signature', signatureCounter, '.sidebar');
       //  const nameDOMTarget = createDOMTarget('name', nameCounter, '.sidebar');
       //  const emailDOMTarget = createDOMTarget('email', emailCounter, '.sidebar');

        // SetTargets pour pouvoir créer les premiers Moveable dans le DOM.
        setTargets([
            {
                // domElt: document.querySelector(`.target-signature-${signatureCounter}`),
                domElt: `target-signature-1`,
                type: 'signature',
                isActive: false,
                id:  1,
            },
            {
                // domElt: document.querySelector(`.target-name-${nameCounter}`),
                domElt: `target-name-1`,
                type: 'name',
                isActive: false,
                id: 1,
            },
            {
                // domElt: document.querySelector(`.target-email-${emailCounter}`),
                domElt: `target-email-1`,
                type: 'email',
                isActive: false,
                id: 1,
            }
        ])

        setTimeout(() => setIsLoading(false), 20)


        // (async () => {
        //    await loadWebViewer()
        //
        //     handleClick()
        // })()
        // loadWebViewer();
        // WebViewer(
        //     {
        //         licenseKey: 'toto',
        //         path: '/pdftron/lib',
        //         initialDoc: '/fixture/sample.pdf',
        //     },
        //     viewer.current,
        // ).then((instance) => {
        //     const { docViewer } = instance;
        //     // you can now call WebViewer APIs here...
        // });
    }, [])



    const handleClick = (instance) => {
        const { docViewer } = instance;
        console.log('docViewer', docViewer);
        // e est un objet event avec des propriétés supp par pdfTron
        docViewer.on('click', (e) => {
            console.log('CLICK', e);

        })
    }

    const incrementCounter = (type) => {
        let newValue;
        switch (type) {
            case SIGNATURE_TYPE:
                console.log('temoin signature');
                newValue = signatureCounter + 1;
                setSignatureCounter(newValue);
                break;
            case EMAIL_TYPE:
                console.log('temoin email');
                newValue = emailCounter + 1
                setEmailCounter(newValue);
                break;
            case NAME_TYPE:
                console.log('temoin name');
                newValue = nameCounter + 1
                setNameCounter(newValue);
                break;
            default:
                return;
        }

        return newValue
    }

    const createDOMTarget = (type, counter) => {

        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }

        const containerMapping = {
            signature: '.sidebar-signature',
            name: '.sidebar-name',
            email: '.sidebar-email'
        }

        const containerElt = document.querySelector(containerMapping[type])
        const targetClassname = `target-${type}-${counter}`
        const targetElt = document.createElement('div');

        targetElt.classList.add(targetClassname);
        targetElt.textContent = type.toUpperCase();
        targetElt.style.width = "150px";
        targetElt.style.height = "30px";
        targetElt.style.backgroundColor = colorMapping[type];
        targetElt.style.color = "white";
        targetElt.style.cursor = "pointer";
        containerElt.appendChild(targetElt)

        return targetClassname;
    }
    // const getDefaultTargets = () => {
    //     return [
    //         {
    //             domElt: document.querySelector(".target-signature-1"),
    //             type: 'signature',
    //             isActive: false,
    //             id: 1,
    //         },
    //         {
    //             domElt: document.querySelector(".target-name-1"),
    //             type: 'name',
    //             isActive: false,
    //             id: 2,
    //         },
    //         {
    //             domElt: document.querySelector(".target-email-1"),
    //             type: 'email',
    //             isActive: false,
    //             id: 3,
    //         }]
    // }

    // const addTarget = (target) => {
    //     targets.push(target)
    //     setTargets(targets);
    // }

    const getStyle = (inputName) => {
        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }

        return {
            width: 150,
            height: 30,
            backgroundColor: colorMapping[inputName],
            color: 'white',
            cursor: 'pointer'
        }
    }

    const createMoveable = (target) => {

        const targetsCopy = JSON.parse(JSON.stringify(targets));

        targetsCopy.forEach((targetFromState, index) => {
            if (targetFromState.id === target.id && targetFromState.type === target.type)
                targetFromState['isActive'] = true;
        })

        console.log('targetCopy AVT AJOUT', targetsCopy);
        // setTargets(targetsCopy);

        const currentTargetElt = document.querySelector(`.${target.domElt}`);
        currentTargetElt.style.position = 'absolute';

        const newCounterValue = incrementCounter(target.type)
        // const newDomTargetName = createDOMTarget(target.type, newCounterValue)

        const newTarget = {
            // domElt: newDomTargetName,
            domElt: `target-${target.type}-${newCounterValue}`,
            type: target.type,
            isActive: false,
            id: newCounterValue
        }

        targetsCopy.push(newTarget);
        console.log('targetCopy APRES AJOUT', targetsCopy);
        setTargets(targetsCopy);
    }

    const test = () => {
        // const {docViewer} = webViewer;
        //
        // console.log("docViewerr", docViewer);

        // addTarget({domElt:"toto",type:'toto'})
    //     const newTarget = {
    //         // domElt: document.querySelector(".target-signature-2"),
    //         type: 'signatursse',
    //         isActive: false,
    //         id: 4,
    //     }
    //      //targets.push(newTarget);
    //     setTargets((targets) => [...targets, newTarget]);
    //     console.log("les targets", targets)
        console.log("Liste targets", targets);
        console.log("Liste moveAble", document.querySelectorAll('.moveable-control-box'))
    }

    return (
        <>
            <div className="sidebar" style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <button onClick={() => {test()}}>ZZ</button>

                <div className="sidebar-signature">
                    {targets.map(targetObj => {
                        if (targetObj.type === SIGNATURE_TYPE)
                            return <DraggableField type={targetObj.type} counter={targetObj.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-name">
                    {targets.map(targetObj => {
                        if (targetObj.type === NAME_TYPE)
                            return <DraggableField type={targetObj.type} counter={targetObj.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-email">
                    {targets.map(targetObj => {
                        if (targetObj.type === EMAIL_TYPE)
                            return <DraggableField type={targetObj.type} counter={targetObj.id} getStyle={getStyle}/>
                    })}
                </div>
                {/*{targets.map(target => (*/}
                {/*    <div className={`target-${target.type}-${target.id}`}*/}
                {/*         style={getStyle(target.type)}*/}
                {/*    >*/}
                {/*        {target.type.toUpperCase()}*/}
                {/*    </div>*/}
                {/*    )*/}
                {/*)}*/}

                {/*<div className="target" style={{width: 150, height: 50, backgroundColor: 'blue', position: 'absolute'}}>DRAGGABLE</div>*/}
            </div>
        <div className="MyComponent" style={{width: '75%'}}>
            {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
            {/*<div className="header">React sample</div>*/}
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
            {/* On créer un Moveable par target*/}
            {!isLoading &&
                targets.map(targetObj => {
                // console.log(`DOM.target-${targetObj.type}-${targetObj.id}`, document.querySelector(`.target-${targetObj.type}-${targetObj.id}`))
                    console.log(targetObj.domElt)
                    console.log("QuerySelectpr",document.querySelector(`.${targetObj.domElt}`));
                    return (
                        <>
                            <Moveable
                                target={document.querySelector(`.${targetObj.domElt}`)}
                                container={null}
                                origin={false}
                                edge={false}
                                draggable={true}
                                throttleDrag={0}
                                onDragStart={({ target, clientX, clientY }) => {
                                    console.log("onDragStart", target);
                                }}
                                onDrag={({
                                             target,
                                             beforeDelta, beforeDist,
                                             left, top,
                                             right, bottom,
                                             delta, dist,
                                             transform,
                                             clientX, clientY,
                                         }) => {
                                    // console.log("onDrag left, top", left, top);
                                    // target!.style.left = `${left}px`; COM BY TUTO
                                    // target!.style.top = `${top}px`; COM BY TUTO
                                    // console.log("onDrag translate", dist);
                                    target.style.transform = transform;
                                    // console.log("targetOBJ", targetObj)
                                    if (!targetObj.isActive) createMoveable(targetObj)
                                }}
                                onDragEnd={({ target, isDrag, clientX, clientY }) => {
                                    // console.log("onDragEnd", target, isDrag);
                                }}
                            />
                        </>
                    )
                }
            )}
        </>
    );
}

export default MainComponent;
