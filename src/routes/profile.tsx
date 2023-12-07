import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;

const AvatarUpload = styled.label`
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        width: 50px;
    }
`;

const AvatarImg = styled.img`
    width: 100%;
`;

const AvatarInput = styled.input`
    display: none;
`;

const NameBox = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Name = styled.span`
    font-size: 22px;
`;

const NameInput = styled.input`
    font-size: 22px;
    background-color: white;
    color: black;
    border-radius: 2px;
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const EditButton = styled.button`
    background-color: transparent;
    border: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    svg {
        width: 20px;
        fill: white;
    }
`;

const Tweets = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ErrorMessage = styled.span`
    color: tomato;
    font-size: 15px;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [isEdit, setIsEdit] = useState(false);
    const [name, setName] = useState(user?.displayName);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isShowError, setIsShowError] = useState(false);
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, { photoURL: avatarUrl });
        }
    };

    const onEditName = async () => {
        if (isEdit) {
            if (!user || name === "") {
                setIsShowError(true);
                return;
            }
            setIsEdit(false);
            setIsShowError(false);
            await updateProfile(user, { displayName: name });
        } else {
            setIsEdit(true);
        }
    };

    const onChangeName = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
    };

    const fetchTweets = async () => {
        const tweetQuery = query(collection(db, "tweets"), where("userId", "==", user?.uid), orderBy("createAt", "desc"), limit(25));
        const snapshot = await getDocs(tweetQuery);
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
    };
    useEffect(() => {
        fetchTweets();
    }, []);

    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {avatar ? (
                    <AvatarImg src={avatar} />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            {/* 이름 수정 */}
            <NameBox>
                {isEdit ? <NameInput onChange={onChangeName} type="text" value={name ? name : ""} /> : <Name>{name ?? "익명"}</Name>}
                <EditButton onClick={onEditName}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                </EditButton>
            </NameBox>
            {isShowError && <ErrorMessage>닉네임을 입력해주세요.</ErrorMessage>}

            <Tweets>
                {tweets.map((tweet) => (
                    <Tweet key={tweet.id} {...tweet} />
                ))}
            </Tweets>
        </Wrapper>
    );
}
