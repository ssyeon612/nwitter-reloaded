import { collection, getDoc, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweets";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createAt: number;
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
`;

export default function Timeline() {
    const [tweets, setTweets] = useState<ITweet[]>([]);

    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(collection(db, "tweets"), orderBy("createAt", "desc"), limit(25));
            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const { tweet, createAt, userId, username, photo } = doc.data();
                    return {
                        tweet,
                        createAt,
                        userId,
                        username,
                        photo,
                        id: doc.id,
                    };
                });
                setTweets(tweets);
            });
        };
        fetchTweets();
        return () => {
            /**
             * 유저가 화면을 보지 않을때 값을 반환하면서 cleanup을 실시
             * useEffetct 훅의 teardown이 실행될 때, 구독을 취소
             */
            unsubscribe && unsubscribe();
        };
    }, []);
    return (
        <Wrapper>
            {tweets.map((tweet) => (
                <Tweet key={tweet.id} {...tweet} />
            ))}
        </Wrapper>
    );
}
