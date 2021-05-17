import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";
import DraggableField from "./DraggableField";


const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);
    const windowInnerHeight = window.innerHeight;

    const [fields, setFields] = useState([]);
    // const [targets, setTargets] = useState([]);
    const [signatureCounter, setSignatureCounter] = useState(1);
    const [emailCounter, setEmailCounter] = useState(1);
    const [nameCounter, setNameCounter] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    // const [target, setTarget] = React.useState();
    const [frame, setFrame] = React.useState({
        translate: [0,0],
    });

    let scrollTimer = null;

    const SIGNATURE_TYPE = 'signature';
    const EMAIL_TYPE = 'email';
    const NAME_TYPE = 'name';

    useEffect(() => {
        console.log('InnerHeight dès le début', windowInnerHeight);
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
            handleEvents(instance)
        }
        loadWebViewer();

        const defaultFields = getDefaultFields();

        setFields(defaultFields);
        // setTimeout(() => {
        //     console.log("UPDATE !")
        // },2000)
        // setTargets(defaultFields);
        // setTargets(defaultFields)

        // waitForFields().then(() => {
        //     // setTargets(defaultFields);
        //     // setIsLoading(false);
        // })

        // (async () => {
        //    await loadWebViewer()
        //
        //     handleClick()
        // })()

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

    useEffect(() => {
        console.log('HELLOOOOOOO')
        console.log('isDragging from useEffet', isDragging);
        console.log('scrollTimer from useEffet', scrollTimer)
        if (scrollTimer && !isDragging) {
            console.log("Hello from UseEffect")
            clearInterval(scrollTimer);
        }
    }, [isScrolling])


    const handleEvents = (instance) => {
        const { docViewer } = instance;
        console.log('docViewer', docViewer);
        // e est un objet event avec des propriétés supp par pdfTron
        docViewer.on('click', (e) => {
            console.log('CLICK', e);
        })

        // const docScrollBar = docViewer.getScrollViewElement()
        // console.log('docScrollBar', docScrollBar);
        // docScrollBar.addEventListener('scroll', () => {
        //     // SCROLL IF NEEDED
        //     // Savoir si un field est en bas de page et non "placé"
        //     getBottomPageItem()
        // })
    }

    // const getBottomPageItem = () => {
    //     // console.log('TRIGGER getBottomPageItem');
    //     // console.log(fields);
    //     let bool = false
    //     fields.forEach((field) => {
    //         // console.log('YPOS', field.yPosition)
    //         if (field.yPosition + 50 >= (windowInnerHeight) && !field.isPlaced) {
    //             console.log("Lui faut scroll", field);
    //             bool = true;
    //         }
    //         return bool;
    //     })
    // }

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

    const getDefaultFields = () => {
        return [
            {
                domElt: 'target-signature-1',
                type: 'signature',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
                id: 1,
            },
            {
                domElt: 'target-name-1',
                type: 'name',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
                id: 1,
            },
            {
                domElt: 'target-email-1',
                type: 'email',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
                id: 1,
            }]
    }

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

    const createMoveable = async (target) => {

        const targetsCopy = JSON.parse(JSON.stringify(fields));

        targetsCopy.forEach((targetFromState, index) => {
            if (targetFromState.id === target.id && targetFromState.type === target.type)
                targetFromState['isActive'] = true;
        })

        const currentTargetElt = document.querySelector(`.${target.domElt}`);
        currentTargetElt.style.position = 'absolute';

        const newCounterValue = incrementCounter(target.type)
        // const newDomTargetName = createDOMTarget(target.type, newCounterValue)

        const newTarget = {
            // domElt: newDomTargetName,
            domElt: `target-${target.type}-${newCounterValue}`,
            type: target.type,
            isActive: false,
            isPlaced: false,
            xPosition: false,
            yPosition: false,
            id: newCounterValue
        }

        targetsCopy.push(newTarget);
        console.log('targetCopy APRES AJOUT', targetsCopy);
        setFields(targetsCopy);

        // await waitForFields()
        // setTimeout(() => {
        //     console.log('update');
        // }, 2000)
        // setTargets(targetsCopy);
    }

    const waitForFields =  () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0)
        })
    }

    const test = () => {
        const {docViewer} = webViewer;
        console.log("docViewerr", docViewer);
        // docViewer.displayLastPage()
        console.log("Total Page",docViewer.getPageCount());
        console.log("Numero Page",docViewer.getCurrentPage());
        console.log(docViewer.getPageHeight(docViewer.getCurrentPage())); // HAUTEUR DE LA PAGE COURANTE DU PDF
        console.log('getScrollViewElement', docViewer.getScrollViewElement())
        console.log(window.innerHeight); // RENVOIE HAUTEUR DE WINDOW

        console.log("Liste fields", fields);
        console.log("Liste moveAble", document.querySelectorAll('.moveable-control-box'))
        console.log("IsScrlling ?", isScrolling);
        const containerToScrollElt = docViewer.getScrollViewElement();
        // containerToScrollElt.scrollBy(0,100)
        console.log(window.scrollY);
    }

    const onDragHandler = (xPosition, yPosition, field) => {
        const { docViewer } = webViewer;
        // const coeff =  window.innerHeight - docViewer.getPageHeight(docViewer.getPageCount())
        // console.log("coeff", coeff);
        // // console.log('position sur laquelle intervenir', window.innerHeight - coeff);
        // GESTION DESCENTE
        // Enregistrer dans le state les nouvelles coords

        // const fieldsCopy = JSON.parse(JSON.stringify(fields));
        //
        // fieldsCopy.forEach((fieldCopy => {
        //     if (fieldCopy.id === field.id && fieldCopy.type === field.type)
        //         fieldCopy.yPosition = yPosition;
        //         fieldCopy.xPosition = xPosition;
        // }))

        fields.forEach((fieldCopy => {
            if (fieldCopy.id === field.id && fieldCopy.type === field.type)
                fieldCopy.yPosition = yPosition;
            fieldCopy.xPosition = xPosition;
        }))
        setFields(fields)

        // setFields(fieldsCopy)

        const containerToScrollElt = docViewer.getScrollViewElement();
        if (yPosition + 50 >= window.innerHeight && !isScrolling) scroll(containerToScrollElt, field)// containerToScrollElt.scrollBy(0,10);

        // setFields(fieldsCopy)
    }

    const scroll = (containerToScroll, field) => {
       // Utiliser un intervalle de valeur pour savoir s'il faut scroll ou pas
       //  if (scrollTimer) return;
        setIsScrolling(true);

        scrollTimer = setInterval(() => {
            console.log("isDraggin ?", isDragging);// Renvoie le resultat au moment de l'execution de scroll() pas du setInterval();
            if (!isDragging) {
                clearInterval(scrollTimer)
                setIsScrolling(false);
            }
            // const realField = getField(field.id, field.type);
            // console.log("Real Field Y", realField.yPosition);

            console.log("windowInnerHeight", window.innerHeight);
            console.log("clientHeifgh", containerToScroll.clientHeight);
            console.log("scrollTimer", scrollTimer);
            console.log("Y", field.yPosition)
            //TODO Repasser a 10 (ou autre) pour le scroll Y
            containerToScroll.scrollBy(0,20);

            // console.log("position field change ou non ?", field);
            if (field.yPosition + 50 < window.innerHeight) {
                clearInterval(scrollTimer)
                // scrollTimer = null
                console.log("hors zone");
                console.log(scrollTimer);
                setIsScrolling(false);
                // return;
            }


            if (containerToScroll.scrollHeight -
                containerToScroll.scrollTop <=
                containerToScroll.clientHeight)
            {
                console.log("AU BOUT")
                clearInterval(scrollTimer);
                setIsScrolling(false)
                // scrollTimer = null
            }
        }, 100)
               //  containerToScroll.scrollBy(0,10)
        // setIsScrolling(false);
    }



    const coverStyle = {
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }

    return (
        <>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <button onClick={() => {test()}}>ZZ</button>
                <div className="sidebar-signature">
                    {fields.map(field => {
                        if (field.type === SIGNATURE_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-name">
                    {fields.map(field => {
                        if (field.type === NAME_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-email">
                    {fields.map(field => {
                        if (field.type === EMAIL_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
            </div>
        <div className="MyComponent" style={{width: '75%', height: '100%'}}>
            {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
            {isDragging &&
            <div style={coverStyle}/>
            }
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
            {/* On créer un Moveable par target*/}
            {/*{!isLoading &&*/
                fields.map(targetObj => {
                // console.log(`DOM.target-${targetObj.type}-${targetObj.id}`, document.querySelector(`.target-${targetObj.type}-${targetObj.id}`))
                //     console.log(targetObj.domElt)
                //     console.log("QuerySelectpr",document.querySelector(`.${targetObj.domElt}`));
                    const targetElt = document.querySelector(`.${targetObj.domElt}`);
                    return (
                        <>
                            <Moveable
                                target={targetElt}
                                container={null}
                                origin={false}
                                edge={false}
                                draggable={true}
                                throttleDrag={0}
                                onDragStart={({ target, clientX, clientY }) => {
                                    console.log("onDragStart", target);
                                    console.log("clientX", clientX);
                                    console.log("clientY", clientY);
                                    setIsDragging(true);
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
                                    // console.log(clientX, clientY);
                                    // console.log("onDrag left, top", left, top);
                                    // target!.style.left = `${left}px`; COM BY TUTO
                                    // target!.style.top = `${top}px`; COM BY TUTO
                                    // console.log("onDrag translate", dist);
                                    target.style.transform = transform;
                                    // target.style.zIndex = 2;
                                    // console.log("targetOBJ", targetObj)
                                    onDragHandler(clientX, clientY, targetObj)
                                    if (!targetObj.isActive) createMoveable(targetObj)
                                }}
                                onDragEnd={({ target, isDrag, clientX, clientY }) => {
                                    console.log("ON DRAG END")
                                    setIsDragging(false);
                                    console.log("scrollTimer from DragEnd", scrollTimer);
                                    clearInterval(scrollTimer);
                                    // target.style.zIndex = 'auto';
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
