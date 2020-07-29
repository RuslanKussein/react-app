import styles from "./App.module.css";
import {ReactComponent as Check} from "./check.svg";
import React from "react";
import {Stories, Story} from "./App";

const SORTS = {
    NONE: list => list,
    TITLE: list => list.sort((a, b) => a.title.localeCompare(b.title)),
    AUTHOR: list => list.sort((a, b) => a.author.localeCompare(b.author)),
    COMMENT: list => list.sort((a, b) => a.num_comments - b.num_comments).reverse(),
    POINT: list => list.sort((a, b) => a.points - b.points).reverse(),
};

const List = ({ list, onRemoveItem }) => {
    const [sort, setSort] = React.useState("NONE");

    const handleSort = (sortKey) => {
        setSort(sortKey);
    };
    const sortFunction = SORTS[sort];
    const sortedList = sortFunction(list);

    return (
        <div>
            <div style={{display: 'flex'}}>
                <span style={{width: '40%'}}>
                    <button onClick={() => handleSort("TITLE")}>
                        Title
                    </button>
                </span>
                <span style={{width: '30%'}}>
                    <button onClick={() => handleSort("AUTHOR")}>
                        Author
                    </button>
                </span>
                <span style={{width: '10%'}}>
                    <button onClick={() => handleSort("COMMENT")}>
                        Comments
                    </button>
                </span>
                <span style={{width: '10%'}}>
                    <button onClick={() => handleSort("POINT")}>
                        Points
                    </button>
                </span>
                <span style={{width: '10%'}}>
                    Actions
                </span>
            </div>

            {sortedList.map(item => (
                <Item
                    key={item.objectID}
                    item={item}
                    onRemoveItem={onRemoveItem}/>
            ))}
        </div>
    );
}

const Item = ({ item, onRemoveItem }) => (
    <div style={{ display: "flex"}}>
        <span style={{width: "40%"}}>
            <a href={item.url}>{item.title}</a>
        </span>
        <span style={{width: "30%"}}>{item.author}</span>
        <span style={{width: "10%"}}>{item.num_comments}</span>
        <span style={{width: "10%"}}>{item.points}</span>
        <span style={{width: "10%"}}>
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

export default List;

