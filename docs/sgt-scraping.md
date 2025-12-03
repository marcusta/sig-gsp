------- TIPS AND SGT SINGLE RECORDS UI -------
URL : https://simulatorgolftour.com/sgt-api/courses/course-records?_=1764761885385

<div class="row px-3 px-lg-5 pb-5 border-bottom border-1 border-sgt-black align-items-center">
    <div class="col-12 col-lg-6 d-flex flex-row justify-content-center justify-content-lg-start">
        <div id="course-search-group" class="input-group">
            <div class="input-group-text">
                <i class="fa-regular fa-magnifying-glass"></i>
            </div>
            <input type="input" placeholder="SEARCH" class="form-control  text-sgt-light" id="course-search-input">
        </div>
    </div>
    <div class="col-12 col-lg-6 d-flex flex-row mt-3 mt-lg-0 justify-content-center justify-content-lg-end">
        <div class="dropdown filter-select position-relative me-2">
            <button class="btn bg-sgt-white text-sgt-dark-gray border-sgt-light-gray dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-regular fa-filter"></i>
            </button>
            <div class="dropdown-menu border-sgt-light-gray">
                <div class="text-sgt-dark-gray text-center three-quarter-font my-1">COURSE DIFFICULTY</div>
                <div data-mut-excl-group="difficulty" data-filter-key="easy" class="dropdown-item filter filter-select-item">
                    <i class="fa-sharp fa-regular fa-square pe-1"></i>
                    <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                    EASY
                                
                </div>
                <div data-mut-excl-group="difficulty" data-filter-key="medium" class="dropdown-item filter filter-select-item">
                    <i class="fa-sharp fa-regular fa-square pe-1"></i>
                    <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                    MEDIUM
                                
                </div>
                <div data-mut-excl-group="difficulty" data-filter-key="hard" class="dropdown-item filter filter-select-item">
                    <i class="fa-sharp fa-regular fa-square pe-1"></i>
                    <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                    HARD
                                
                </div>
                <hr>
                <div class="text-sgt-dark-gray text-center three-quarter-font my-1">COURSE STYLE</div>
                <div class="row">
                    <div class="col-6">
                        <div data-mut-excl-group="style" data-filter-key="par3" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            PAR 3
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="BeginnerFriendly" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            BEGINNER
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Coastal" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            COASTAL
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Desert" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            DESERT
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Fantasy" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            FANTASY
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Heathland" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            HEATHLAND
                                        
                        </div>
                    </div>
                    <div class="col-6">
                        <div data-mut-excl-group="style" data-filter-key="Historic" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            HISTORIC
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Mountain" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            MOUNTAIN
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Parkland" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            PARKLAND
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Training" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            TRAINING
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Tropical" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            TROPICAL
                                        
                        </div>
                        <div data-mut-excl-group="style" data-filter-key="Links" class="dropdown-item filter filter-select-item">
                            <i class="fa-sharp fa-regular fa-square pe-1"></i>
                            <i class="fa-sharp fa-solid fa-square-check pe-1"></i>
                            LINKS
                                        
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="sort-select" class="dropdown position-relative">
            <button data-sort-key="NAME" class="btn bg-sgt-white text-sgt-dark-gray border-sgt-light-gray dropdown-toggle text-uppercase text-start" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                NAME <i class="fa-solid fa-arrow-up"></i>
            </button>
            <span id="sort-select-arrow">
                <i class="fa-solid fa-caret-down text-sgt-red"></i>
            </span>
            <div class="dropdown-menu border-sgt-light-gray">
                <div class='text-sgt-dark-gray text-center three-quarter-font my-1'>COURSE</div>
                <div role='button' data-sort-key='course-name' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    name <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='course-name' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    name <i class='fa-solid fa-arrow-down'></i>
                </div>
                <div role='button' data-sort-key='course-updated' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    updated <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='course-updated' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    updated <i class='fa-solid fa-arrow-down'></i>
                </div>
                <hr>
                <div class='text-sgt-dark-gray text-center three-quarter-font my-1 text-uppercase'>tips RECORD</div>
                <div role='button' data-sort-key='tips-score' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    score <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='tips-score' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    score <i class='fa-solid fa-arrow-down'></i>
                </div>
                <div role='button' data-sort-key='tips-player' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    player <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='tips-player' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    player <i class='fa-solid fa-arrow-down'></i>
                </div>
                <div role='button' data-sort-key='tips-date' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    date <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='tips-date' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    date <i class='fa-solid fa-arrow-down'></i>
                </div>
                <hr>
                <div class='text-sgt-dark-gray text-center three-quarter-font my-1 text-uppercase'>sgt RECORD</div>
                <div role='button' data-sort-key='sgt-score' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    score <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='sgt-score' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    score <i class='fa-solid fa-arrow-down'></i>
                </div>
                <div role='button' data-sort-key='sgt-player' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    player <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='sgt-player' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    player <i class='fa-solid fa-arrow-down'></i>
                </div>
                <div role='button' data-sort-key='sgt-date' data-sort-direction='asc' class=' dropdown-item sort-select-item text-uppercase'>
                    date <i class='fa-solid fa-arrow-up'></i>
                </div>
                <div role='button' data-sort-key='sgt-date' data-sort-direction='desc' class=' dropdown-item sort-select-item text-uppercase'>
                    date <i class='fa-solid fa-arrow-down'></i>
                </div>
            </div>
        </div>
    </div>
</div>
<div class='row px-3 px-lg-5 overflow-hidden'>
    <div class='text-sgt-light text-end pt-5 pb-3'>
        LAST UPDATED <span class='divider'></span>
        06:34 EST
    </div>
    <div class='overflow-auto'>
        <table class='course-records-table'>
            <thead>
                <tr>
                    <th class='course-name expand-cell p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-start three-quarter-font'>COURSE</th>
                    <th class='p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-start three-quarter-font'></th>
                    <th colspan='3' class='course-record-sgt p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-center three-quarter-font'>TIPS</th>
                    <th colspan='3' class='course-record-sgt p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-center three-quarter-font'>SGT</th>
                </tr>
                <thead>
                <tbody>
                    <tr data-course-id='2341' data-search-terms='3 Ponds Farm' data-filter-medium='1' data-filter-BeginnerFriendly='1' data-filter-Parkland='1' data-sort-course-updated='2025-07-21' data-sort-course-name='3 Ponds Farm' data-sort-tips-player='' data-sort-tips-date='' data-sort-tips-score='' data-sort-sgt-player='' data-sort-sgt-date='' data-sort-sgt-score=''>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>3 Ponds Farm
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='3 Ponds Farm' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_2341.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center tips-player'>
                            <a href='/event-register/course-record/tips/2341'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center sgt-player'>
                            <a href='/event-register/course-record/sgt/2341'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                    </tr>
                    <tr data-course-id='825' data-search-terms='3s Greenville|Bobchung|Bradford' data-filter-medium='1' data-filter-par3='1' data-sort-course-updated='2024-12-12' data-sort-course-name='3s Greenville' data-sort-tips-player='Bobchung' data-sort-tips-date='2023-06-01' data-sort-tips-score='-10' data-sort-sgt-player='Bradford' data-sort-sgt-date='2023-12-29' data-sort-sgt-score='-9'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>3s Greenville
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='3s Greenville' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_825.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 tips-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/o7fl22zqcd8zzqzrzqzssc4re3alnm13kyybvynxlfrkqnulbl' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-kr fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bobchung' class='text-sgt-white  text-uppercase text-decoration-none'>Bobchung</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-06-01</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/7179/79'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-10</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='825' data-tour-type='CRTips' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/tips/825'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 sgt-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/nks7r4dpst9zgwxf46xe3yecthwlghgta8xwl6sezxqhsa8pnv' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-us fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bradford' class='text-sgt-white  text-uppercase text-decoration-none'>Bradford</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-12-29</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/9533/4082'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-9</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='825' data-tour-type='CR' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/sgt/825'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='1841' data-search-terms='401 Par Golf, Par 3 Course.' data-filter-Parkland='1' data-filter-Training='1' data-sort-course-updated='2024-09-24' data-sort-course-name='401 Par Golf, Par 3 Course.' data-sort-tips-player='' data-sort-tips-date='' data-sort-tips-score='' data-sort-sgt-player='' data-sort-sgt-date='' data-sort-sgt-score=''>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>401 Par Golf, Par 3 Course.
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='401 Par Golf, Par 3 Course.' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_1841.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center tips-player'>
                            <a href='/event-register/course-record/tips/1841'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center sgt-player'>
                            <a href='/event-register/course-record/sgt/1841'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                    </tr>
                    <tr data-course-id='2215' data-search-terms='49 Challenge Course|Wilks306|Baldo' data-filter-medium='1' data-filter-BeginnerFriendly='1' data-filter-Fantasy='1' data-filter-Parkland='1' data-sort-course-updated='2025-02-19' data-sort-course-name='49 Challenge Course' data-sort-tips-player='Wilks306' data-sort-tips-date='2025-03-04' data-sort-tips-score='-13' data-sort-sgt-player='Baldo' data-sort-sgt-date='2025-04-23' data-sort-sgt-score='-16'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>49 Challenge Course
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='49 Challenge Course' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_2215.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 tips-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/4zzqa6g1fxz5guwiowpkzfbas8z9r7zjk5pwzt2cgqzvcnctwv' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-gb fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Wilks306' class='text-sgt-white  text-uppercase text-decoration-none'>Wilks306</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2025-03-04</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/23554/11159'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-13</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='2215' data-tour-type='CRTips' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/tips/2215'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 sgt-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='0' data-lazyloadtype='img' data-lazyloadurl='' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-us fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Baldo' class='text-sgt-white  text-uppercase text-decoration-none'>Baldo</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2025-04-23</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/25951/1442'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-16</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='2215' data-tour-type='CR' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/sgt/2215'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='618' data-search-terms='A-Ga-Ming Sundance|Bomberhilde|themooks' data-filter-medium='1' data-sort-course-updated='2022-10-26' data-sort-course-name='A-Ga-Ming Sundance' data-sort-tips-player='Bomberhilde' data-sort-tips-date='2023-02-18' data-sort-tips-score='-11' data-sort-sgt-player='themooks' data-sort-sgt-date='2022-11-18' data-sort-sgt-score='-12'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>A-Ga-Ming Sundance
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='A-Ga-Ming Sundance' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_618.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 tips-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/ors6r475bph893qx5dg6c39ofs3s3rxml8jx6exydncotg5tu6' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-se fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bomberhilde' class='text-sgt-white  text-uppercase text-decoration-none'>Bomberhilde</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-02-18</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/5510/3291'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-11</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='618' data-tour-type='CRTips' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/tips/618'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 sgt-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='0' data-lazyloadtype='img' data-lazyloadurl='' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-ca fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/themooks' class='text-sgt-white  text-uppercase text-decoration-none'>themooks</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2022-11-18</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/4050/363'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-12</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='618' data-tour-type='CR' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/sgt/618'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='602' data-search-terms='Abacoa Golf Club|Bomberhilde|Bobchung' data-filter-medium='1' data-filter-Parkland='1' data-filter-Tropical='1' data-sort-course-updated='2023-12-07' data-sort-course-name='Abacoa Golf Club' data-sort-tips-player='Bomberhilde' data-sort-tips-date='2023-02-18' data-sort-tips-score='-12' data-sort-sgt-player='Bobchung' data-sort-sgt-date='2023-03-20' data-sort-sgt-score='-10'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>Abacoa Golf Club
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='Abacoa Golf Club' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_602.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 tips-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/ors6r475bph893qx5dg6c39ofs3s3rxml8jx6exydncotg5tu6' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-se fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bomberhilde' class='text-sgt-white  text-uppercase text-decoration-none'>Bomberhilde</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-02-18</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/5518/3291'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-12</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='602' data-tour-type='CRTips' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/tips/602'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 sgt-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/o7fl22zqcd8zzqzrzqzssc4re3alnm13kyybvynxlfrkqnulbl' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-kr fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bobchung' class='text-sgt-white  text-uppercase text-decoration-none'>Bobchung</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-03-20</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/6248/79'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-10</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='602' data-tour-type='CR' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/sgt/602'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='2356' data-search-terms='ABC Supply Stadium' data-filter-Fantasy='1' data-sort-course-updated='2025-04-08' data-sort-course-name='ABC Supply Stadium' data-sort-tips-player='' data-sort-tips-date='' data-sort-tips-score='' data-sort-sgt-player='' data-sort-sgt-date='' data-sort-sgt-score=''>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>ABC Supply Stadium
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='ABC Supply Stadium' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_2356.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center tips-player'>
                            <a href='/event-register/course-record/tips/2356'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                        <td colspan='3' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center sgt-player'>
                            <a href='/event-register/course-record/sgt/2356'>
                                <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </a>
                        </td>
                    </tr>
                    <tr data-course-id='400' data-search-terms='Aberdeen Golf Club|Bomberhilde|k4rn1v00l' data-filter-medium='1' data-filter-Links='1' data-sort-course-updated='2022-11-29' data-sort-course-name='Aberdeen Golf Club' data-sort-tips-player='Bomberhilde' data-sort-tips-date='2023-02-19' data-sort-tips-score='-14' data-sort-sgt-player='k4rn1v00l' data-sort-sgt-date='2022-01-19' data-sort-sgt-score='-13'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name expand-cell text-sgt-white'>Aberdeen Golf Club
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='Aberdeen Golf Club' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_400.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 tips-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/ors6r475bph893qx5dg6c39ofs3s3rxml8jx6exydncotg5tu6' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-se fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/Bomberhilde' class='text-sgt-white  text-uppercase text-decoration-none'>Bomberhilde</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2023-02-19</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/5534/3291'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-14</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='400' data-tour-type='CRTips' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/tips/400'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 sgt-player'>
                            <div class='d-flex flex-row align-items-center'>
                                <div class='player-avatar-wrapper position-relative '>
                                    <div class='bg-sgt-md-gray player-avatar '>
                                        <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/ubumupob1i4s6euydhj2yq37d6v5m9mf8f9lo0skqja3sls3ff' src='/public/assets/images/avatar/default-avatar.jpg'>
                                    </div>
                                    <div class='player-flag fib fi-us fis '></div>
                                </div>
                                <div class='ps-2 d-flex flex-column'>
                                    <a href='/profile/k4rn1v00l' class='text-sgt-white  text-uppercase text-decoration-none'>k4rn1v00l</a>
                                    <div class='text-sgt-light three-quarter-font text-uppercase text-nowrap'>2022-01-19</div>
                                </div>
                            </div>
                        </td>
                        <td class='py-2 py-md-3'>
                            <a class='text-decoration-none' href='/scorecard/1306/139'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-13</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <div data-course-id='400' data-tour-type='CR' role='button' class='ldr-link text-sgt-white bg-sgt-light-gray rounded text-center p-2'>
                                    <i class='fa-light fa-trophy fa-lg' aria-hidden='true'></i>
                                </div>
                                <a href='/event-register/course-record/sgt/400'>
                                    <button class='btn btn-outline red attempt-button px-2 py-2 ms-2 three-quarter-font' type='button'>ATTEMPT</button>
                                </a>
                            </div>
                        </td>
                    </tr>
                    .......



------- TIPS SCRAMBE 2-MAN TEAM RECORDS -------
URL : https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT1?_=1764762191605

<div class='row px-3 px-lg-5 py-5 overflow-hidden'>
    <h3 class='mb-3 mb-lg-5 col-12 col-lg-8 text-center text-lg-start text-sgt-white text-uppercase'>TIPS SCRAMBLE (2) RECORDS</h3>
    <div class='mb-3 mb-lg-5 col-12 col-lg-4 d-flex flex-row justify-content-center justify-content-lg-end text-light align-self-center'>
        LAST UPDATED <span class='divider'></span>
        11:36 EST
    </div>
    <div class='overflow-auto'>
        <table class='course-records-table'>
            <thead>
                <tr>
                    <th class='course-name expand-cell p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-start three-quarter-font'>COURSE</th>
                    <th class='p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-start three-quarter-font'></th>
                    <th colspan='4' class='course-record-sgt p-2 p-md-3 px-lg-4 px-xxl-5 text-nowrap text-sgt-light  text-center three-quarter-font'>RECORD</th>
                </tr>
                <thead>
                <tbody>
                    <tr data-course-id='2341' data-search-terms='3 Ponds Farm|Reubs|Hughiee' data-filter-medium='1' data-filter-BeginnerFriendly='1' data-filter-Parkland='1' data-sort-course-updated='2025-07-21' data-sort-course-name='3 Ponds Farm' data-sort-date='2025-11-23' data-sort-score='-8'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white'>3 Ponds Farm
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='3 Ponds Farm' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_2341.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 player'>
                            <div class='d-flex flex-row flex-nowrap align-items-center'>
                                <div class='d-flex flex-column me-3'>
                                    <div class='d-flex flex-row align-items-center my-2'>
                                        <div class='player-avatar-wrapper position-relative '>
                                            <div class='bg-sgt-md-gray player-avatar '>
                                                <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/c5fz37v1ll2ox1u00rdvche2sqznjkmc8yi2n8cecjjux4jma9' src='/public/assets/images/avatar/default-avatar.jpg'>
                                            </div>
                                            <div class='player-flag fib fi-gb fis '></div>
                                        </div>
                                        <div class='ps-2 d-flex flex-column'>
                                            <a href='/profile/Reubs' class='text-sgt-white  text-uppercase text-decoration-none'>Reubs</a>
                                        </div>
                                    </div>
                                    <div class='d-flex flex-row align-items-center my-2'>
                                        <div class='player-avatar-wrapper position-relative '>
                                            <div class='bg-sgt-md-gray player-avatar '>
                                                <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/ft9etkf4a5hnjbmc76sgzrghcfqgdfp86nb1j1lr592vegqehf' src='/public/assets/images/avatar/default-avatar.jpg'>
                                            </div>
                                            <div class='player-flag fib fi-gb fis '></div>
                                        </div>
                                        <div class='ps-2 d-flex flex-column'>
                                            <a href='/profile/Hughiee' class='text-sgt-white  text-uppercase text-decoration-none'>Hughiee</a>
                                        </div>
                                    </div>
                                </div>
                                <div class='d-flex flex-column'></div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 text-nowrap text-sgt-light'>2025-11-23</td>
                        <td class='p-2 p-md-3'>
                            <a class='text-decoration-none' href='/scorecard/36793/30814'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-8</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 pe-lg-4 pe-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <button data-course-id='2341' data-format='TCRT1' class='btn btn-outline red attempt-button px-2 py-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='825' data-search-terms='3s Greenville|Reubs|BlueScreenFTW' data-filter-medium='1' data-filter-par3='1' data-sort-course-updated='2024-12-12' data-sort-course-name='3s Greenville' data-sort-date='2025-11-23' data-sort-score='-4'>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white'>3s Greenville
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='3s Greenville' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_825.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 player'>
                            <div class='d-flex flex-row flex-nowrap align-items-center'>
                                <div class='d-flex flex-column me-3'>
                                    <div class='d-flex flex-row align-items-center my-2'>
                                        <div class='player-avatar-wrapper position-relative '>
                                            <div class='bg-sgt-md-gray player-avatar '>
                                                <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/c5fz37v1ll2ox1u00rdvche2sqznjkmc8yi2n8cecjjux4jma9' src='/public/assets/images/avatar/default-avatar.jpg'>
                                            </div>
                                            <div class='player-flag fib fi-gb fis '></div>
                                        </div>
                                        <div class='ps-2 d-flex flex-column'>
                                            <a href='/profile/Reubs' class='text-sgt-white  text-uppercase text-decoration-none'>Reubs</a>
                                        </div>
                                    </div>
                                    <div class='d-flex flex-row align-items-center my-2'>
                                        <div class='player-avatar-wrapper position-relative '>
                                            <div class='bg-sgt-md-gray player-avatar '>
                                                <img data-lazyload='1' data-lazyloadtype='img' data-lazyloadurl='/sgt-api/avatar/soc3zc39vsfsladlajg7yqm4g4u5lha4u889j9fzui8ewnigev' src='/public/assets/images/avatar/default-avatar.jpg'>
                                            </div>
                                            <div class='player-flag fib fi-gb fis '></div>
                                        </div>
                                        <div class='ps-2 d-flex flex-column'>
                                            <a href='/profile/BlueScreenFTW' class='text-sgt-white  text-uppercase text-decoration-none'>BlueScreenFTW</a>
                                        </div>
                                    </div>
                                </div>
                                <div class='d-flex flex-column'></div>
                            </div>
                        </td>
                        <td class='p-2 p-md-3 text-nowrap text-sgt-light'>2025-11-23</td>
                        <td class='p-2 p-md-3'>
                            <a class='text-decoration-none' href='/scorecard/36803/30814'>
                                <div class='text-sgt-white bg-sgt-light-gray rounded text-center p-2'>-4</div>
                            </a>
                        </td>
                        <td class='p-2 p-md-3 pe-lg-4 pe-xxl-5'>
                            <div class='d-flex flex-row justify-content-center align-items-center'>
                                <button data-course-id='825' data-format='TCRT1' class='btn btn-outline red attempt-button px-2 py-2 three-quarter-font' type='button'>ATTEMPT</button>
                            </div>
                        </td>
                    </tr>
                    <tr data-course-id='1841' data-search-terms='401 Par Golf, Par 3 Course.' data-filter-Parkland='1' data-filter-Training='1' data-sort-course-updated='2024-09-24' data-sort-course-name='401 Par Golf, Par 3 Course.' data-sort-date='' data-sort-score=''>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white'>401 Par Golf, Par 3 Course.
                            </td>
                        <td class='p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white'>
                            <div class='d-flex flex-row align-items-center'>
                                <div role='button' data-course-name='401 Par Golf, Par 3 Course.' data-action-type='scorecard' data-card-path='/public/assets/courseImages/scorecards/scorecard_1841.jpg?v=1.0' class='course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center'>
                                    <i class='fa-light fa-memo fa-lg'></i>
                                </div>
                            </div>
                        </td>
                        <td colspan='4' class='p-2 p-md-3 px-lg-4 px-xxl-5 text-center player'>
                            <button data-course-id='1841' data-format='TCRT1' class='btn btn-outline red attempt-button px-2 py-2 three-quarter-font' type='button'>ATTEMPT</button>
                        </td>
                    </tr>
                .............


------- TIPS SCRAMBLE 4-MAN TEAM RECORDS -------
URL : https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT2?_=1764762191606
Starts with same as before payloads

                    <tr data-course-id=' 2767 ' data-search-terms=' Bribie Island Golf Club|Owen_M|Scuba1974|tmac2881|Typhoon0702 ' 
                          data-filter-easy=' 1 '  data-filter-Coastal=' 1 '  
                          data-sort-course-updated=' 2025-11-05 ' 
                          data-sort-course-name=' Bribie Island Golf Club '
                          data-sort-date=' 2025-11-06 ' data-sort-score=' -13 '>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white '>
                                Bribie Island Golf Club
                            </td>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white '>
                                <div class=' d-flex flex-row align-items-center '>
                                    <div role=' button ' data-course-name=' Bribie Island Golf Club ' data-action-type=' scorecard ' data-card-path=' /public/assets/courseImages/scorecards/scorecard_2767.jpg?v=1.0 ' class=' course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center '>
                                <i class=' fa-light fa-memo fa-lg '></i>
                            </div>
                                </div>
                            </td>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 player '><div class=' d-flex flex-row flex-nowrap align-items-center '><div class=' d-flex flex-column me-3 '><div class=' d-flex flex-row align-items-center my-2 '>
                                            <div class=' player-avatar-wrapper position-relative '>
                        <div class=' bg-sgt-md-gray player-avatar '>
                            <img data-lazyload=' 0 ' data-lazyloadtype=' img ' data-lazyloadurl='' src=' /public/assets/images/avatar/default-avatar.jpg '>
                        </div>
                        <div class=' player-flag fib fi-au fis '></div>
                    </div>
                                            <div class=' ps-2 d-flex flex-column '>
                                                <a href=' /profile/Owen_M ' class=' text-sgt-white text-uppercase text-decoration-none '>Owen_M</a>
                                            </div>
                                        </div>
                                        <div class=' d-flex flex-row align-items-center my-2 '>
                                            <div class=' player-avatar-wrapper position-relative '>
                        <div class=' bg-sgt-md-gray player-avatar '>
                            <img data-lazyload=' 1 ' data-lazyloadtype=' img ' data-lazyloadurl=' /sgt-api/avatar/7rd1qhftow62p7ke7i0hepdi1uwg48u15exveri84knjav5ehs ' src=' /public/assets/images/avatar/default-avatar.jpg '>
                        </div>
                        <div class=' player-flag fib fi-us fis '></div>
                    </div>
                                            <div class=' ps-2 d-flex flex-column '>
                                                <a href=' /profile/Scuba1974 ' class=' text-sgt-white text-uppercase text-decoration-none '>Scuba1974</a>
                                            </div>
                                        </div>
                                        </div><div class=' d-flex flex-column '><div class=' d-flex flex-row align-items-center my-2 '>
                                            <div class=' player-avatar-wrapper position-relative '>
                        <div class=' bg-sgt-md-gray player-avatar '>
                            <img data-lazyload=' 1 ' data-lazyloadtype=' img ' data-lazyloadurl=' /sgt-api/avatar/6ggdhoueu3p6zezcxxpa33axttem8md9ys0wenj1vqgll5hcxe ' src=' /public/assets/images/avatar/default-avatar.jpg '>
                        </div>
                        <div class=' player-flag fib fi-us fis '></div>
                    </div>
                                            <div class=' ps-2 d-flex flex-column '>
                                                <a href=' /profile/tmac2881 ' class=' text-sgt-white text-uppercase text-decoration-none '>tmac2881</a>
                                            </div>
                                        </div>
                                        <div class=' d-flex flex-row align-items-center my-2 '>
                                            <div class=' player-avatar-wrapper position-relative '>
                        <div class=' bg-sgt-md-gray player-avatar '>
                            <img data-lazyload=' 0 ' data-lazyloadtype=' img ' data-lazyloadurl='' src=' /public/assets/images/avatar/default-avatar.jpg '>
                        </div>
                        <div class=' player-flag fib fi-us fis '></div>
                    </div>
                                            <div class=' ps-2 d-flex flex-column '>
                                                <a href=' /profile/Typhoon0702 ' class=' text-sgt-white text-uppercase text-decoration-none '>Typhoon0702</a>
                                            </div>
                                        </div>
                                        </div></div></td>
                            <td class=' p-2 p-md-3 text-nowrap text-sgt-light '>2025-11-06</td>
                            <td class=' p-2 p-md-3 '><a class=' text-decoration-none ' href=' /scorecard/35389/2754 '><div class=' text-sgt-white bg-sgt-light-gray rounded text-center p-2 '>-13</div></a></td>
                            <td class=' p-2 p-md-3 pe-lg-4 pe-xxl-5 '>
                                    <div class=' d-flex flex-row justify-content-center align-items-center '>
                                        <button data-course-id=' 2767 ' data-format=' TCRT2 'class=' btn btn-outline red attempt-button px-2 py-2 three-quarter-font ' type=' button '>ATTEMPT</button>
                                    </div>
                                </td>
                        </tr><tr data-course-id=' 1939 ' data-search-terms=' Brickyard Crossing ' 
                          data-filter-easy=' 1 '  data-filter-Historic=' 1 '  data-filter-Parkland=' 1 '  
                          data-sort-course-updated=' 2024-12-02 ' 
                          data-sort-course-name=' Brickyard Crossing '
                          data-sort-date='' data-sort-score=''>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white '>
                                Brickyard Crossing
                            </td>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white '>
                                <div class=' d-flex flex-row align-items-center '>
                                    <div role=' button ' data-course-name=' Brickyard Crossing ' data-action-type=' scorecard ' data-card-path=' /public/assets/courseImages/scorecards/scorecard_1939.jpg?v=1.0 ' class=' course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center '>
                                <i class=' fa-light fa-memo fa-lg '></i>
                            </div>
                                </div>
                            </td>
                            <td colspan=' 4 ' class=' p-2 p-md-3 px-lg-4 px-xxl-5 text-center player '><button data-course-id=' 1939 ' data-format=' TCRT2 'class=' btn btn-outline red attempt-button px-2 py-2 three-quarter-font ' type=' button '>ATTEMPT</button></td>
                        </tr><tr data-course-id=' 1003 ' data-search-terms=' Bridgewater Golf Club - East ' 
                          data-filter-medium=' 1 '  data-filter-Parkland=' 1 '  
                          data-sort-course-updated=' 2023-11-07 ' 
                          data-sort-course-name=' Bridgewater Golf Club - East '
                          data-sort-date='' data-sort-score=''>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 course-name text-sgt-white '>
                                Bridgewater Golf Club - East
                            </td>
                            <td class=' p-2 p-md-3 px-lg-4 px-xxl-5 text-sgt-white '>
                                <div class=' d-flex flex-row align-items-center '>
                                    <div role=' button ' data-course-name=' Bridgewater Golf Club - East ' data-action-type=' scorecard ' data-card-path=' /public/assets/courseImages/scorecards/scorecard_1003.jpg?v=1.0 ' class=' course-card-button ms-2 text-sgt-white bg-sgt-light-gray rounded text-center '>
                                <i class=' fa-light fa-memo fa-lg '></i>
                            </div>
                                </div>
                            </td>
                            <td colspan=' 4 ' class=' p-2 p-md-3 px-lg-4 px-xxl-5 text-center player '><button data-course-id=' 1003 ' data-format=' TCRT2 'class=' btn btn-outline red attempt-button px-2 py-2 three-quarter-font ' type=' button '>ATTEMPT</button></td>
                        </tr>
                        .........

                        