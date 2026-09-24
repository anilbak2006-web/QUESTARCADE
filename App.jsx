
import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import questPlayLogo from './LOGO.png'
import './App.css'
import quizzses from './quizzses'
import QuizPage from './QuizPage'

function normalizeAssetPath(path) {
    if (!path) return path
    if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path
    return `/${path}`
}

function QuizRoute({ handleQuizCompleted }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const quiz = quizzses.find((item) => item.id === id)

    return (
        <>
            {!quiz ? (
                <p>Quiz bulunamadı.</p>
            ) : (
                <QuizPage
                    quiz={quiz}
                    onBack={() => navigate('/')}
                    onQuizCompleted={handleQuizCompleted}
                />
            )}
        </>
    )
}

function App() {

    function InfoXpLevelBtn() {
        if (!clickLevelBtn) {
            setClickLevelBtn(true);

        } else {
            setClickLevelBtn(false);

        }
    }

    function NavFilterMenu({ buttons }) {
        return <div className='BtnFilter'>{buttons}</div>
    }

    // Restore the total number of completed quizzes when the app starts.
    const [QuizTotalCount, setQuizTotalCount] = useState(() => {
        return Number(localStorage.getItem("QuizTotalCount")) || 0;
    });

    // Restore the user's selected page theme from local storage.
    const [pageColor, setPageColor] = useState(
        () => localStorage.getItem("PageColor") || "Main"
    )


    const [xplevel, setXpLevel] = useState(
        Number(localStorage.getItem("xplevel")) || 0
    );

    const [userLevel, setUserLevel] = useState(
        Number(localStorage.getItem("userLevel")) || 1
    );

    const [InfoXpLevel, setInfoXpLevel] = useState("");
    const [clickLevelBtn, setClickLevelBtn] = useState(false);
    const [isPageScrolled, setIsPageScrolled] = useState(false);

    useEffect(() => {
        function handlePageScroll() {
            setIsPageScrolled((window.scrollY || document.documentElement.scrollTop) > 24);
        }

        handlePageScroll();
        window.addEventListener('scroll', handlePageScroll, { passive: true });

        return () => window.removeEventListener('scroll', handlePageScroll);
    }, []);

    // Persist the completed quiz count whenever it changes.
    useEffect(() => {
        localStorage.setItem("QuizTotalCount", QuizTotalCount);



    }, [QuizTotalCount]);


    useEffect(() => {
        localStorage.setItem("xplevel", xplevel);
    }, [xplevel]);

    useEffect(() => {
        localStorage.setItem("userLevel", userLevel);
    }, [userLevel]);

    function handleQuizCompleted() {
        const completedCount = QuizTotalCount + 1;
        let levelDivisor = 7;
        let xpMultiplier = 5;

        if (xplevel >= 400) {
            levelDivisor = 2;
            xpMultiplier = 15;
        } else if (xplevel >= 100) {
            levelDivisor = 3;
            xpMultiplier = 10;
        } else if (xplevel >= 50) {
            levelDivisor = 4;
            xpMultiplier = 7;
        }

        const nextLevel = Math.floor(completedCount / levelDivisor) + 1;

        setQuizTotalCount(completedCount);
        setUserLevel(nextLevel);
        setXpLevel(previousXp => previousXp + nextLevel * xpMultiplier);
    }



    // Apply and persist the selected theme for the whole document.
    useEffect(() => {
        const activeBackground = pageColor === 'Changed'
            ? 'black'
            : 'red'

        document.body.style.background = activeBackground
        document.documentElement.style.background = activeBackground
        document.body.style.backgroundAttachment = 'fixed'
        document.documentElement.style.backgroundAttachment = 'fixed'

        localStorage.setItem("PageColor", pageColor)
    }, [pageColor])





    function HomePage({ pageColor, setPageColor }) {
        const navigate = useNavigate()

        // Switch to the dark theme and persist the selection immediately.
        function ChangePageColor() {
            setPageColor('Changed')
            localStorage.setItem('PageColor', 'Changed')
        }

        // Restore the default theme and persist the selection immediately.
        function MainPageColor() {
            setPageColor('Main')
            localStorage.setItem('PageColor', 'Main')
        }
        const [activeFilter, setActiveFilter] = useState('MainBtn');

        function FilterBtn(event) {
            setActiveFilter(event.currentTarget.name);
        }

        const FilterQuizses = quizzses.filter((quiz) => {
            if (activeFilter === "MainBtn") {
                return true;
            }

            if (activeFilter === "PersonalityBtn") {
                return quiz.type === "personality"
            }

            if (activeFilter === "KnowladgleBtn") {
                return quiz.type === "knowladge";

            }



        })



        return (
            <>
                {!isPageScrolled && createPortal(
                    <div className="XpLevelContainer" style={{ position: 'fixed' }}>
                        <h2 className="XpLevelInfo">TOPLAM XP: {xplevel}</h2>
                        <h2 className="UserLevelInfo">Kullanıcı Seviyesi: {userLevel}</h2>
                        <div className="XpLevelInfoText">
                            <button className="XpLevelBtn" onClick={InfoXpLevelBtn}>{clickLevelBtn ? 'ANLADIM !' : 'BİLGİ'}</button>
                        </div>
                        {clickLevelBtn ? (
                            <span className="XpLevelDescription">
                                Ne kadar çok test çözerseniz o kadar çok level kazanırsınız leveliniz arttıkça xp toplama oranızı o kadar artar !
                            </span>
                        ) : null}
                    </div>,
                    document.body
                )}

                <header className={clickLevelBtn ? 'xp-info-open' : ''}>

                    <div className='header_size'>
                        <h1 className='HeaderTitle'>Oyun ve Kişilik Testleri | QuestArcade</h1>
                        <p className='PageInfo'>Şimdi Testleri Çözmeye Başlayarak, Ne Kadar İyi Bir Oyuncu Olduğunu Test Et !</p>
                    </div>
                    <div className='QuestPlayLogo'>
                        <img src={questPlayLogo} alt='QuestPlaylogo' width='260' height='129' fetchPriority='high' />
                    </div>
                    <nav>
                        <NavFilterMenu
                            buttons={
                                <>
                                    <button name='MainBtn' className={activeFilter === "MainBtn" ? 'activeBtn' : ''} onClick={FilterBtn}>BÜTÜN TESTLER BİR ARADA</button>
                                    <button name='PersonalityBtn' className={activeFilter === "PersonalityBtn" ? 'activeBtn' : ''} onClick={FilterBtn}>SADECE KİŞİLİK TESTLERİ</button>
                                    <button name='KnowladgleBtn' className={activeFilter === "KnowladgleBtn" ? 'activeBtn' : ''} onClick={FilterBtn}>SADECE BİLGİ TESTLERİ</button>
                                </>
                            }


                        >
                        </NavFilterMenu>


                    </nav>

                    <span className='changecolor_info'>
                        <h3>Buradan Sayfa Arayüz Rengini Değiştirebilirsin !</h3>
                    </span>

                    <nav>
                        <div className='UserCountContainer'>
                            <h2 className='UserCountInfo'>Toplam Çözülen Test Sayısı: {QuizTotalCount}</h2>
                        </div>

                    </nav>

                    <section>
                        <div className='QuestContainer'>
                            <div className='QuestStyles'>
                                {/* Each image acts as a link to its corresponding quiz. */}
                                {FilterQuizses.map((quiz, index) => (
                                    quiz.image ? (
                                        <img
                                            key={quiz.id}
                                            src={normalizeAssetPath(quiz.image)}
                                            alt={quiz.title}
                                            width='1280'
                                            height='720'
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                            fetchPriority={index === 0 ? 'high' : 'auto'}
                                            decoding='async'
                                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                                        />
                                    ) : (
                                        <button
                                            key={quiz.id}
                                            className='QuestPlaceholder'
                                            type='button'
                                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                                        >
                                            {quiz.title}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className='ChanePageColors'>
                        <div className='ChangeColorContainer'>
                            <div className='ChangePageColorStyle'>
                                <div className='ChangeColorItems'>
                                    <button className='changePageColor' onClick={ChangePageColor}>
                                        <img src='/dark.png' title='Karanlık Temaya Geç' width='100' height='100' loading='lazy' decoding='async' />
                                        <span className='black_info'>Karanlık Temaya Geç</span>
                                    </button>

                                    <button className='mainPageColor' onClick={MainPageColor}>
                                        <img src='/main.png' title='Ana Temaya Geri Dön' width='100' height='100' loading='lazy' decoding='async' />
                                        <span className='main_color_info'>Ana Temaya Geri Dön</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header >
            </>
        )
    }

//aaa
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<HomePage
                    pageColor={pageColor}
                    setPageColor={setPageColor}
                />} />
                <Route
                    path='/quiz/:id'
                    element={
                        <Suspense fallback={<p className='PageLoading'>Quiz yükleniyor...</p>}>
                            <QuizRoute
                                handleQuizCompleted={handleQuizCompleted}
                            />
                        </Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
