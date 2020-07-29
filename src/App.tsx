import React from 'react';
import axios from "axios";
import styles from "./App.module.css";
import styled from 'styled-components';
import { ReactComponent as Check } from './check.svg';

type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
}

type Stories = Array<Story>;

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};

type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
};

interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT';
}
interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS';
    payload: Stories;
}
interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE';
}
interface StoriesRemoveAction {
    type: 'REMOVE_STORY';
    payload: Story;
}

type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction;


const StyledContainer = styled.div`
    height: 100vw;
    padding: 20px;
    background: #83a4d4;
    background: linear-gradient(to left, #b6fbff, #83a4d4);
    color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
`;

const StyledItem = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 5px;
`;

const StyledButton = styled.button`
    background: transparent;
    border: 1px solid #171212;
    padding: 5px;
    cursor: pointer;
    transition: all 0.1s ease-in;
    &:hover {
    background: #171212;
    color: #ffffff;
    }
`;

const StyledButtonSmall = styled(StyledButton)`
    padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`;

const StyledSearchForm = styled.form`
    padding: 10px 0 20px 0;
    display: flex;
    align-items: baseline;
`;

const StyledLabel = styled.label`
    border-top: 1px solid #171212;
    border-left: 1px solid #171212;
    padding-left: 5px;
    font-size: 24px;
`;

const StyledInput = styled.input`
    border: none;
    border-bottom: 1px solid #171212;
    background-color: transparent;
    font-size: 24px;
`;


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key: string, initialState: string):[string, (newValue:string) => void] => {
    const isMounted = React.useRef(false);
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            localStorage.setItem(key, value);
        }
    }, [value, key]);

    return [value, setValue];
};

const storiesReducer = (state: StoriesState, action: StoriesAction)  => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    story => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};


const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {data: [], isLoading: false, isError: false}
    );

    const handleFetchStories = React.useCallback(() => {
        if (!searchTerm) return;
        dispatchStories({ type: 'STORIES_FETCH_INIT' });
        axios
            .get(url)
            .then(result => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.data.hits,
                });
            })
            .catch(() =>
                dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
            );
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = React.useCallback((item: Story) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    }, []);


    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);
        event.preventDefault();
    };

    console.log("B:App");

    return (
        <StyledContainer>
            <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>
            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            {stories.isError && <p>Something went wrong ...</p>}

            {stories.isLoading ? (
                <p>Loading ...</p>
            ) : (
                <List
                    list={stories.data}
                    onRemoveItem={handleRemoveStory}/>
            )}
        </StyledContainer>
    );
};

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm= ({
    searchTerm,
    onSearchInput,
    onSearchSubmit} : SearchFormProps) => (
    <StyledSearchForm onSubmit={onSearchSubmit}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>
        <StyledButtonLarge type="submit" disabled={!searchTerm}>
            Submit
        </StyledButtonLarge>
    </StyledSearchForm>
);

type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused?: boolean;
    children: React.ReactNode;
};

const InputWithLabel = ({
    id,
    value,
    type = 'text',
    onInputChange,
    isFocused,
    children,
   }: InputWithLabelProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null!);

    React.useEffect(() => {
        if (inputRef.current && isFocused) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <>
            <StyledLabel htmlFor={id}>{children}</StyledLabel>
            &nbsp;
            <StyledInput
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                onChange={onInputChange}
            />
        </>
    );
};

const List = ({ list, onRemoveItem } : ListProps) =>
    <>
        {list.map(item => (
        <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}/>
        ))}
    </>

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
}

const Item = ({ item, onRemoveItem }: ItemProps) => (
        <div>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
                 <button
                     type="button"
                     onClick={() => onRemoveItem(item)}
                     className={`${styles.button} ${styles.buttonSmall}`}
                 >
                    <Check height="18px" width="18px" />
                </button>
            </span>
        </div>
);

export default App;
export {SearchForm, StyledInput, List, Item};