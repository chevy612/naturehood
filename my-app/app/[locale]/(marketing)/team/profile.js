import { Children } from "react"

function Card({title, children,}){
    return (
        <div className="border rounded-lg p-4 m-4 shadow-lg">
            {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
            <div>{children}</div>
        </div>
    )
}

export default function Profile(){
    return (
        <div>
            <Card title="Co-Founder & CTO">
                <p>Name: Chevy Cheung</p>
            </Card>
            <Card title="Co-Founder & Content Creator">
                <p>Name: Colin Cheung</p>
            </Card>
        </div>
        
    )
}