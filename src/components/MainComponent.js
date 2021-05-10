import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);

    const [targets, setTargets] = useState([]);
    const [signatureCounter, setSignatureCounter] = useState(1);
    const [emailCounter, setEmailCounter] = useState(1);
    const [nameCounter, setNameCounter] = useState(1)

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


        setTargets([
            {
                // domElt: document.querySelector(`.target-signature-${signatureCounter}`),
                domElt: `target-signature-${signatureCounter}`,
                type: 'signature',
                isActive: false,
                id: signatureCounter,
            },
            {
                // domElt: document.querySelector(`.target-name-${nameCounter}`),
                domElt: `target-name-${nameCounter}`,
                type: 'name',
                isActive: false,
                id: nameCounter,
            },
            {
                // domElt: document.querySelector(`.target-email-${emailCounter}`),
                domElt: `target-email-${emailCounter}`,
                type: 'email',
                isActive: false,
                id: emailCounter,
            }
        ])
        // addTargets({
        //     domElt: document.querySelector(".target-signature-1"),
        //     type: 'signature'
        // })
        // addTargets({
        //     domElt: document.querySelector(".target-name-1"),
        //     type: 'name'
        // })
        // addTargets({
        //     domElt: document.querySelector(".target-email-1"),
        //     type: 'email'
        // })

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
        switch (type) {
            case SIGNATURE_TYPE:
                setSignatureCounter((signatureCounter) => signatureCounter + 1);
                break;
            case EMAIL_TYPE:
                setEmailCounter((emailCounter) => emailCounter + 1);
                break;
            case NAME_TYPE:
                setNameCounter((nameCounter) => nameCounter + 1);
                break;
            default:
                return;
        }
    }

    const createDOMTarget = (type, counter, container) => {

        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }
        const containerElt = document.querySelector(container)
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

    const addTarget = (target) => {
        targets.push(target)
        setTargets(targets);
    }

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
        // console.log("CREATE MOVEABLE", target);
        // target.isActive = true;

        //TODO Not sure if it's needed
        // target['toto'] = 'toto';
        const targetsCopy = JSON.parse(JSON.stringify(targets));
        targetsCopy.forEach((targetFromState, index) => {
            if (targetFromState.id === target.id && targetFromState.type === target.type)
                targetFromState['isActive'] = true;
        })
        console.log('targCopy', targetsCopy);
        console.log('targs', targets);
        setTargets(targetsCopy);

        const newDomTargetName = createDOMTarget(target.type, )
        // setTargets(targets);

        // console.log("targets with update", targets)
        // Créér un movable = créer un élément dans le dom, (une nouvelle div avec la classe target) et un objet target
        // dans le state
       //  const sidebarElt = document.querySelector('.sidebar-signature');
       //  const newDivElt = document.createElement('div')
       //  newDivElt.classList.add('target-signature-2');
       //  newDivElt.textContent = 'SIGNATURE';
       //  newDivElt.style.width = "150px";
       //  newDivElt.style.height = "30px";
       //  newDivElt.style.backgroundColor = "blue";
       //  newDivElt.style.color = "white";
       //  newDivElt.style.cursor = "pointer";
       //  sidebarElt.appendChild(newDivElt);
       //
       //  const newTarget = {
       //      domElt: document.querySelector(".target-signature-2"),
       //      type: 'signature',
       //      isActive: false,
       //      id: 4,
       //  }
       //
       // targetsCopy.push(newTarget);
       //  console.log("targets pre set", targets)


    }

    const test = () => {
        // const {docViewer} = webViewer;
        //
        // console.log("docViewerr", docViewer);

        // addTarget({domElt:"toto",type:'toto'})
        const newTarget = {
            // domElt: document.querySelector(".target-signature-2"),
            type: 'signatursse',
            isActive: false,
            id: 4,
        }
         //targets.push(newTarget);
        setTargets((targets) => [...targets, newTarget]);
        console.log("les targets", targets)
    }

    return (
        <>
            <button onClick={() => {test()}}>ZZ</button>
            <div className="sidebar" style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%"}}>
                SIDEBAR
                {/*Soit on récupere la position initial de chaque target */}
                {/*Soit on créer une div wrapper pour chaque type de target et quand on récréé une target*/}
                {/*on l'ajoute en enfant de cette div wrapper.*/}
                {/*<div className="sidebar-signature">*/}
                <div className={`target-signature-${signatureCounter}`} style={getStyle('signature')}>SIGNATURE</div>
                {/*/!*<div style={{marginBottom: 20}} />*!/*/}
                {/*</div>*/}
                <div className={`target-name-${nameCounter}`} style={getStyle('name')}>NOM</div>
                {/*/!*<div style={{marginBottom: 20}}/>*!/*/}
                <div className={`target-email-${emailCounter}`} style={getStyle('email')}>EMAIL</div>
                {/*/!*<div style={{marginBottom: 20}}/>*!/*/}
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
            {targets.map(targetObj => {
                console.log(`DOM.target-${targetObj.type}-${targetObj.id}`, document.querySelector(`.target-${targetObj.type}-${targetObj.id}`))
                return (
                    <>
                    <p>{targetObj.type}</p>
                    <Moveable
                        target={document.querySelector(`.target-${targetObj.type}-${targetObj.id}`)}
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
                            console.log("targetOBJ", targetObj)
                            if (!targetObj.isActive) createMoveable(targetObj)
                        }}
                        onDragEnd={({ target, isDrag, clientX, clientY }) => {
                            // console.log("onDragEnd", target, isDrag);
                        }}
                    />
                    </>
                )
            })}
        </>
    );
}

export default MainComponent;
