import React from 'react';
import axios from "axios";
import styled from 'styled-components';
import List from "./List";
import SearchForm from "./SearchForm";


type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
}

type Stories = Array<Story>;


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
const extractSearchTerm = (url:string) => url.replace(API_ENDPOINT, '');

const getLastSearches = (urls:Array<string>) => urls.slice(-5).map(url =>extractSearchTerm(url));

const getUrl = (searchTerm:string) => `${API_ENDPOINT}${searchTerm}`;

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [urls, setUrls] = React.useState([getUrl(searchTerm)]);

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {data: [], isLoading: false, isError: false}
    );

    const handleFetchStories = React.useCallback(() => {
        if (!searchTerm) return;
        dispatchStories({ type: 'STORIES_FETCH_INIT' });
        const lastUrl = urls[urls.length - 1];
        axios
            .get(lastUrl)
            .then(result => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.data.hits,
                });
            })
            .catch(() =>
                dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
            );
    }, [urls]);

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
        handleSearch(searchTerm);
        event.preventDefault();
    };

    const handleLastSearch = (searchTerm: string) => {
        handleSearch(searchTerm);
    };

    const handleSearch = (searchTerm: string)=> {
        const url = getUrl(searchTerm);
        setUrls(urls.concat(url));
    };

    const lastSearches = getLastSearches(urls);

    return (
        <StyledContainer>
            <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>
            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            {lastSearches.map (searchTerm => (
                <button
                    key={searchTerm}
                    type="button"
                    onClick={() => handleLastSearch(searchTerm)}
                >
                    {searchTerm}
                </button>
            ))}

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

export default App;
export type {Story, Stories};