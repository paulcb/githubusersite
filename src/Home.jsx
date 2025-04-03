import './App.css'
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <>
            <p className="read-the-docs">
                Github Pages Website for showcasing projects, blogs, and more
                <br />
                - Paul Basinger
            </p>
            <div className="card">
                <div className="cardDate">3/3/2025</div>
                <div style={{ display: 'inline' }}>
                    <Link to="/amazething"><p><b>aMazeThing - An AWS Cloud Game</b></p></Link>
                </div>

            </div>

            <div className="card">
                <div className="cardDate">4/2/2025</div>
                <div style={{ display: 'inline' }}>
                <Link to="/cacheblog"><p><b>Cache Blog</b></p></Link>
                </div>
            </div>
        </>
    );
};

export default Home;
