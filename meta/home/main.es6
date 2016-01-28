/**
 * FOR HOME
 */

import 'react'

let HelloMessage = React.createClass({
    render () {
        return <div>The Content Are Created By {this.props.name}</div>
    }
})



function renderHello (argument) {
    ReactDOM.render(
        <HelloMessage name="React" />, 
        document.getElementById('demo1')
    )
}



setTimeout(()=>{

    renderHello()

}, 1200)


export {
    renderHello
}