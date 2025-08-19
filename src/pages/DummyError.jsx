import React from 'react'

const DummyError = () => {

    throw new Error("Test")

    return (
        <div>DummyError</div>
    )
}

export default DummyError