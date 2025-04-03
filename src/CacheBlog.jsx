import { useEffect } from 'react';

import statTable1 from './assets/Table1.1.png'
import statTable2 from './assets/Table2.1.png'
import statTable3 from './assets/Table3.png'
import statTable4 from './assets/Table4.png'
import errorImage from './assets/trace_error.png'
import Prism from "prismjs";

import { PROCESS_KEY_CODE, DOCKER_COMPOSE_CODE, CACHE_WORKER_CODE, APP_FILES_LS } from './constants';

const repoString = "https://github.com/paulcb/cache_test_app/blob/main"

const CacheBlog = () => {
    useEffect(() => {
        Prism.highlightAll();
    }, []);


    return (
        <>
            <div className="card">
                <div className="cardDate">4/2/2025</div>
                <div style={{ display: 'inline' }}>
                    I Dunno Here's Some Cache Stuff
                    &nbsp;--&nbsp;
                    <a className="carda" href={repoString}>
                        code
                    </a>

                </div>
                
                <br /><br />
                Caching software like Redis and Memcached are gotos for speeding up requests between client and server. Lately, there have been examples showing PostgreSQL’s ability to cache data which might already exist in a platform's infrastructure <a href="https://martinheinz.dev/blog/105">[1]</a>. Using already existing infrastructure is a tempting way to get performance gains. This post looks at PostgreSQL’s cache mechanism and compares to existing caching software.
                <br /><br />

                Runtimes and mean response times for cache hits and misses are tested for four caching methods, Redis, Memcached, PostgreSQL Unlogged Table, and Python Cache are analyzed. Single instances are used with Python multithreading to simulate concurrent requests. For realistic testing, trace files from “ARC: A SELF-TUNING, LOW OVERHEAD REPLACEMENT CACHE” (ARC paper) are used in testing [2] [3]. Also, a few randomized trace files were generated.

                <br /><br />

                The caching design is hopefully familiar: database requests are retrieved to fill a cache for later requests. Moreover, a request specifies some identifier from the database. If the identifier didn’t already exist in that case, it’s retrieved from the data store and set in the cache. Since this blog post is just looking into response times a smaller static message size of 16 bytes was given to all trace file values. Making the test like cached website session tokens. In the ARC paper, trace file values depend on the second column for the number of blocks all 512 bytes in size.

                <br /><br />

                In the Table 1 below, Memcached shows significant write latency. Redis is overall probably the best choice since it offers best read and write latency. PostgreSQL is what one would expect, an OK choice. This is just randomly generated test data. Let's try the ARC paper's trace data in the Table 3.

                <br /><br />
                Table 1 - Cache value sizes all 16 bytes - 2 Threads
                <img src={statTable2} alt="logo" />

                <br /><br />

                Something to think about is that better performance is achieved on reads in PostgreSQL if a standard database table is used to pull from. Using a PostgreSQL Cache will have benefits on writes [2] and storing unstructured data from more complex queries. Larger databases and doing JOINs, PARTIONs, and or GROUP BY queries could benefit from a cache storing unstructured the data in JSONB attribute. This post is looking general response time and comparing to other caching methods. Perhaps this more complex usage could be included and analyzed later. More complexities would be introduced such as ejecting cache entries on main table updates. See Table 2 showing no cache table reads and a cache table with unlogged tag removed. There is a performance gained to using UNLOGGED tables as shown. Moreoever, using a single thread helps performance on all cache types because of queuing within the services which operate on data sequentily. So 2 threads are used in these tests to simulate a more realistic environment.

                <br /><br />

                Table 2 - Things to consider
                <img src={statTable4} alt="logo" />

                <br /><br />

                With realistic traces, performance is similar with the Python Cache performing best since it's a runtime cache in the test suite to show raw performance without a connection in the way. Memcached was left out of these tests given significant write latency. So far though, all these tests have given max memory for the cache types. Let's enable LRU for Redis and Python Cache.

                <br /><br />

                Table 3 - Cache value 16 bytes times number of blocks in trace file - 2 Threads
                <img src={statTable1} alt="logo" />

                <br /><br />
                Table 4 - LRU Redis and Python Cache, PostgreSQL pg_cron enabled (remove in cache if greater than 5 mins old) - 2 Threads


                <img src={statTable3} alt="logo" />

                <br />
                pg_cron setting was based of initial runtime of OLTP.lis of ~ 16 minutes for PostgreSQL Cache and ejecting 5 minutie of cache items. With about 1/3 the runtime in mind, the LRU cache sizes were made 1/3 size of number of keys. This works for OLTP.lis since the block sizes are all the same so with varying blocks an averaged approach would be beter. And in Table 4 the reduction in mean response and throughput show the effect of the cache size / pg_cron setting.
                <br />
                <br />
                Cache size for Redis and Python Cache based on 1/3 size of OLTP.lis key count (186,880) and 512 block value
                <br />
                <br />
                Cache size set from ((512 * 186880 / 1024 / 1024) / 3) = ~ 30 Mb

                <br /><br />

                When enabling the cache policies, a similuar performance to max memory is seen. This could be enough to say that no matter what policy is enabled in PosgreSQL with pg_cron, Redis is going to be the better choice for performance. Hang on though.

                <br /><br />

                To speak to the inconsistency of Redis and Python Cache using an LRU vs. the pg_cron method in PostgreSQL, an unlogged table could be given a last used attribute, but it would require a write during the which feels icky when actually trying to represent a cache. I’m pretty sure Redis and Memcache use a more clever approach and move a recently read identifier from its place in a doubly linked list to the front of it. This allows for constant time updating which I've seen implemented before. With PostgreSQL there's isn't going to be a constant time update so at least for tests here, the remove oldest cache times will be used.

                <br /><br />

                <br /><br />
                <b>Here's an interesting issue that occurred with PostgreSQL.</b>
                <br /><br />

                <img src={errorImage} alt="logo" />

                <br /><br />

                Using the multithreaded requests, a missing key was attempting to write to the cache when another had already written at the same time. In this case, since this is only for testing purposes, the key is put back on the queue. The queuing is done by Python's queue library which is helpful when doing multithreaded processing since it has blocking and timeout features.


                <br /><br />
                <b>More on infrastructure and code:</b>
                <br /><br />

                Infrastructure containers were provisioned using Docker Compose for PostgreSQL with pg_cron, Redis, and Memcached. The container_config folder has the compose.yaml and Dockerfile settings. The PostgreSQL pg_cron Dockerfile and scripts were implemented referencing [3] which was super useful and one of the first posts I looked at regarding PostgreSQL caching.


                <br /><br />

                <a href={repoString + "container_config/compose.yaml"}>cache_test_app/container_config/compose.yaml</a>

                <pre>
                    <code className="language-python" style={{ fontSize: '13px' }}>
                        {DOCKER_COMPOSE_CODE}
                    </code>
                </pre>

                <br /><br />

                PostgreSQL connecting and SQLAlchemy ORM libraries made commit sessions and database implementation using automapping and class tables.

                <br /><br />

                The various caches are organized into classes that rely on a base cache class that make use of Python wacky class inheritance. For example, Python method overrides aren’t verbose in any way but there is a library to achieve that with _.

                <br /><br />
                <pre>
                    <code className="language-bash">
                        {APP_FILES_LS}
                    </code>
                </pre>

                <a href={repoString + "app/app.py"}>cache_test_app/app/cache.py</a>

                <pre>
                    <code className="language-python" style={{ fontSize: '13px' }}>
                        {CACHE_WORKER_CODE}
                    </code>
                </pre>

                <br /><br />

                <a href={repoString + "app/redis_cache.py"}>cache_test_app/app/redis_cache.py</a>

                <pre>
                    <code className="language-python" style={{ fontSize: '13px' }}>
                        {PROCESS_KEY_CODE}
                    </code>
                </pre>

                <br /><br />

                <br /><br />

                Lastly, the scripts folder contains the various scripts used to generate random trace file data and out an accompanying sql file which Docker postgres can load in its entry point location. The ARC paper trace files are here but not included in the repo. There are some comment lines in places for configuring the ARC paper trace files if it peaks one's interest. A small random trace fill is in the repo to run the app out of the box.

                <br /><br />
                References:
                <br />
                1. https://martinheinz.dev/blog/105
                <br />
                2. https://www.usenix.org/legacy/event/fast03/tech/full_papers/megiddo/megiddo.pdf
                <br />
                3. https://github.com/moka-rs/cache-trace/tree/main/arc
                <br />
            </div>

        </>
    );
};

export default CacheBlog;
