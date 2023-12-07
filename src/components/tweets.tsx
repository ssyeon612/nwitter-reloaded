import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;

const Button = styled.button`
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    &.edit {
        background-color: #1d9bf0;
    }
    &.delete {
        background-color: tomato;
        margin-right: 5px;
    }
`;

const TextArea = styled.textarea`
    padding: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    border: none;
    &:focus {
        outline: none;
    }
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
    const [isEdit, setIsEdit] = useState(false);
    const [editedTweet, setEditedTweet] = useState(tweet);
    const user = auth.currentUser;
    const onDelete = async () => {
        const ok = confirm("정말 트윗을 삭제하시겠습니까?");
        if (!ok || user?.uid !== userId) return;
        try {
            await deleteDoc(doc(db, "tweets", id));
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            console.log(e);
        } finally {
        }
    };
    const onEdit = async () => {
        if (user?.uid !== userId) return;
        setIsEdit(true);
        try {
            // 수정버튼이 활성화 되어 있을때
            if (isEdit) {
                const tweetRef = doc(db, "tweets", id);
                const updateData: { tweet: string; photo?: string } = { tweet: editedTweet };
                console.log(updateData);
                await updateDoc(tweetRef, updateData);
                setIsEdit(false);
            }
        } catch (e) {
            console.log(e);
        } finally {
        }
    };

    return (
        <Wrapper>
            <Column>
                <Username>{username}</Username>
                {isEdit ? <TextArea required rows={4} maxLength={180} value={editedTweet} onChange={(e) => setEditedTweet(e.target.value)} /> : <Payload>{tweet}</Payload>}
                {!isEdit && user?.uid === userId ? (
                    <Button className="delete" onClick={onDelete}>
                        삭제
                    </Button>
                ) : null}
                {user?.uid === userId ? (
                    <Button onClick={onEdit} className="edit">
                        수정
                    </Button>
                ) : null}
            </Column>
            <Column>{photo ? <Photo src={photo} /> : null}</Column>
        </Wrapper>
    );
}
