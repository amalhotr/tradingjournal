import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { TradingViewWidget } from "./components/TVChart"
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes, listTrades } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  createTrade as createTradeMutation
} from "./graphql/mutations";


const options = [
  { id: 1, name: 'Option 1', content: 'Content for Option 1' },
  { id: 2, name: 'Option 2', content: 'Content for Option 2' },
  { id: 3, name: 'Option 3', content: 'Content for Option 3' },
]

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [trades, setTrades] = useState([]);

  const [selectedTrade, setSelectedTrade] = useState([])
  const [selectedOption, setSelectedOption] = useState(options[0])

  const [newTradeTicker, setNewTradeTicker] = useState('');
  const [newTradeType, setNewTradeType] = useState('');
  const [newTradeEnterTime, setNewTradeEnterTime] = useState('');
  const [newTradeExitTime, setNewTradeExitTime] = useState('');
  const [newTradeNotes, setNewTradeNotes] = useState('');
  const [newTradePnl, setNewTradePnl] = useState('');

  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionContent, setNewOptionContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleTradeClick = (trade) => {
    setTrades(trade);
  };

  const handleNewOptionSubmit = (event) => {
    event.preventDefault();

    const newOption = {
      id: options.length + 1,
      name: newOptionName,
      content: newOptionContent,
    };

    options.push(newOption);
    setSelectedOption(newOption);
    setNewOptionName('');
    setNewOptionContent('');
    setShowPopup(false);
  };

  const handleNewTradeSubmit = (event) => {
    event.preventDefault();

    const newTrade = {
      ticker: newTradeTicker,
      type: newTradeType,
      enterTime: newTradeEnterTime,
      exitTime: newTradeExitTime,
      notes: newTradeNotes,
      pnl: newTradePnl,
    };

    createTrade(event, newTrade);

    trades.push(newTrade);
    setSelectedTrade(newTrade);
    setNewTradeTicker('');
    setNewTradeType('');
    setNewTradeEnterTime('');
    setNewTradeExitTime('');
    setNewTradeNotes('');
    setNewTradePnl('');
    setShowPopup(false);
  };


  useEffect(() => {
    fetchNotes();
    fetchTrades();
    console.log(trades)
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function fetchTrades() {
    const apiData = await API.graphql({ query: listTrades });
    const tradesFromAPI = apiData.data.listTrades.items;
    console.log(tradesFromAPI)
    setTrades(tradesFromAPI);
    console.log("Trades Below: ")
    console.log(trades)
  }

  async function createTrade(event, newTrade) {
    event.preventDefault();

    await API.graphql({
      query: createTradeMutation,
      variables: { input: newTrade },
    });
    fetchTrades();
    event.target.reset();
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  
  return (
    <View className="App" style={{height:'100%'}}>
      <Heading level={1}>Trading Journal</Heading>
      <Grid container spacing={2} style={{height:'95%'}}>
        <Grid xs={2} style={{height:'90%'}}>
          <div className="scrollable-container">
            {/* <ul className="options-list">
              <li className="add-option" onClick={() => setShowPopup(true)}>
              + Add Option
              </li>
              {options.map((option) => (
                <li
                  key={option.id}
                  className={option === selectedOption ? 'selected' : ''}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name}
                </li>
              ))}
            </ul> */}
            <List>
              <ListItemButton  onClick={() => setShowPopup(true)}>
              Add New Trade
              </ListItemButton>
              {options.map((option) => (
                <ListItemButton
                  key={option.id}
                  className={option === selectedOption ? 'selected' : ''}
                  onClick={() => handleOptionClick(option)}
                >
                  <ListItemText primary={option.name} secondary="this is secondary"/>
                </ListItemButton>
              ))}
            </List>

          </div>
        </Grid> 
        <Grid xs={10} style={{height:'90%'}}>
          <div style={{height:'75%'}}>
            <TradingViewWidget />
          </div>
          <div style={{height:'20%'}}>
            <h3>This is the metadata</h3>
            <h3>This is the metadata</h3>
            <h3>This is the metadata</h3>
            <h3>This is the metadata</h3>
            <h3>This is the metadata</h3>
            <h3>This is the metadata</h3>
          </div>
          
        </Grid> 
      </Grid>

        {showPopup && (
          <div className="popup">
            <form onSubmit={handleNewTradeSubmit}>
              <h3>Add New Option</h3>
              <label>
                Ticker Name:
                <input
                  type="text"
                  placeholder="ex. AAPL, EURUSD, etc"
                  value={newTradeTicker}
                  onChange={(e) => setNewTradeTicker(e.target.value)}
                />
              </label>
              <label>
                Trade Type:
                <input
                  type="text"
                  placeholder="BUY or SELL"
                  value={newTradeType}
                  onChange={(e) => setNewTradeType(e.target.value)}
                ></input>
              </label>
              <label>
                Enter Date/Time:
                <input
                  type="text"
                  placeholder="MMDDYYYY-HH:MM:SS"
                  value={newTradeEnterTime}
                  onChange={(e) => setNewTradeEnterTime(e.target.value)}
                ></input>
              </label>
              <label>
                Exit Date/Time:
                <input
                  type="text"
                  placeholder="MMDDYYYY-HH:MM:SS"
                  value={newTradeExitTime}
                  onChange={(e) => setNewTradeExitTime(e.target.value)}
                ></input>
              </label>
              <label>
                PnL:
                <input
                  type="number"
                  placeholder="ex. 143 or -132"
                  value={newTradePnl}
                  onChange={(e) => setNewTradePnl(e.target.value)}
                ></input>
              </label>
              <label>
                Notes:
                <textarea
                  type="text"
                  placeholder="Notes on the trade"
                  value={newTradeNotes}
                  onChange={(e) => setNewTradeNotes(e.target.value)}
                ></textarea>
              </label>
              <button type="submit">Add</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </form>
          </div>
        )}
    </View>  
    
  );
};

export default withAuthenticator(App);