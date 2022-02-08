import { useEffect, useState  } from "react"
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { actionLogout } from '../store/auth'
import '../assets/css/Textarea.css'
import api from '../api'

function randColor() {
    const
        r = Math.floor(Math.random() * (256)),
        g = Math.floor(Math.random() * (256)),
        b = Math.floor(Math.random() * (256))
    const color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
    return color 
}


const INTERVAL_MS = 2000

const TextComponent = (props) => {
    let [text, setText] = useState(' ')
    let [otherId, setOtherId] = useState()


    const dispatch = useDispatch()
    const navigate = useNavigate()
    const idPerson = useSelector(state => state.id)
    const loginPerson = useSelector(state => state.login)


    //загрузка документа
    useEffect(() => {
        if (props.socket === undefined || text === '') return

        props.socket.on('load-document', otherIdRes => {
            otherIdRes.forEach(elemRes => {
                otherId?.map(elemMy => {
                    if(elemMy.id === elemRes.id)
                        {
                            elemRes.color=elemMy.color
                            return
                        }
                })

                if(!elemRes.color) {elemRes.color=randColor()}
            })
            setOtherId(otherIdRes)
        })

        props.socket.emit('get-document', idPerson)
        }, [props.socket, text])

    // сохранение документа
    useEffect(() => {
        if (props.socket === undefined || text === '') return 
        const interval = setInterval(() => {
            props.socket.emit('save-document', text)
        }, INTERVAL_MS)
        return () => {
            clearInterval(interval)
          }
    
      }, [props.socket, text])

    async function submitPost (evt) {
        evt.preventDefault()

        const obgReq = {login: loginPerson, content: text}
        const response = await api.posts.createPosts(obgReq)

        if (response.data.successfully) {
            alert('You sent the post')
        }
        else alert('The shipment was unsuccessful')
    }

    function logOut(evt) {
        evt.preventDefault()
        alert('logged out')
        dispatch(actionLogout())
        navigate('/form') 
        props.socket.emit('delete-document', idPerson)
    }

    function inpytText(evt) {
        props.socket.emit('send-changes', evt.target.value)
        props.socket.on('receive-changes', textServe =>{
            setText(textServe)
        })
        console.log(text)



        // props.socket.emit('delete-document', idPerson)
    }


    return (
        <div>
            <div className="others">
                {otherId?.map((elem, index) => (<div className="other-id" key={index} style = { {background: elem.color} } ></div>))}
            </div>
            <form onSubmit={submitPost}>
                <textarea  
                    contentEditable 
                    suppressContentEditableWarning 
                    onChange={inpytText}
                    // onChange={evnt => {setText(evnt.target.value); console.log(text)}}
                    value={text}
                />
                <input type="submit"  value="Send" />
                <button onClick={logOut}>Log out</button>
            </form>           
        </div>

    )
}

export default TextComponent