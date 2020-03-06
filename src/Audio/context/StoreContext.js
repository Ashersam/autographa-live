import React, { createContext, Component } from 'react';
import { default as localforage } from 'localforage';
import AutographaStore from '../../components/AutographaStore';
import swal from 'sweetalert';
import mergeAudios from '../core/mergeAudios';
const constants = require('../../util/constants');
let saveRec = require('../core/savetodir');
let timerfuction;
export const StoreContext = createContext();

class StoreContextProvider extends Component {
	state = {
		isOpen: true,
		onselect: 1,
		record: false,
		recordedFiles: {},
		storeRecord: [],
		recVerse: [],
		isWarning: false,
		blob: '',
		secondsElapsed: 0,
		timer: false,
		totalTime: 0,
		recVerseTime: [],
	};

	toggleOpen = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};

	setTimer = (time) => {
		this.setState({ secondsElapsed: time });
	};
	
	resetTimer = () => {
		this.setState({ secondsElapsed: 0 });
	};

	selectPrev = (vId) => {
		AutographaStore.isWarning = false;
		AutographaStore.isPlaying = false;
		AutographaStore.currentSession = true;
		if (this.state.onselect > 1 && AutographaStore.isRecording === false) {
			this.setState({ onselect: AutographaStore.vId - 1 });
			AutographaStore.vId = AutographaStore.vId - 1;
			this.state.recVerse.map((value, index) => {
				if (value.toString() === AutographaStore.vId.toString()) {
					AutographaStore.isWarning = true;
					AutographaStore.currentSession = false;
					this.resetTimer();
				}
			});
		} else {
			if (this.state.onselect > 1)
				swal({
					title: 'Are you sure?',
					text: 'You want stop the currently recording verse',
					icon: 'warning',
					buttons: true,
					dangerMode: true,
				}).then((willDelete) => {
					if (willDelete) {
						this.stopRecording();
						this.setState({ secondsElapsed: 0 });
						AutographaStore.currentSession = false;
						swal('Stopped Recording!', {
							icon: 'success',
						});
					}
				});
		}
	};

	selectNext = (vId) => {
		AutographaStore.currentSession = true;
		AutographaStore.isPlaying = false;
		AutographaStore.isWarning = false;
		if (
			this.state.onselect <= AutographaStore.chunkGroup.length - 1 &&
			AutographaStore.isRecording === false
		) {
			this.setState({ onselect: AutographaStore.vId + 1 });
			this.resetTimer();
			AutographaStore.vId = AutographaStore.vId + 1;
			this.state.recVerse.map((value, index) => {
				if (value.toString() === AutographaStore.vId.toString()) {
					AutographaStore.isWarning = true;
					AutographaStore.currentSession = false;
				}
			});
		} else {
			if (this.state.onselect <= AutographaStore.chunkGroup.length - 1) {
				swal({
					title: 'Are you sure?',
					text: 'You want stop the currently recording verse',
					icon: 'warning',
					buttons: true,
					dangerMode: true,
				}).then((willDelete) => {
					if (willDelete) {
						this.resetTimer();
						this.stopRecording();
						swal('Stopped Recording!', {
							icon: 'success',
						});
					}
				});
			}
		}
	};

	resetVal = (value, event, index) => {
		this.setState({ onselect: value });
	};

	startRecording = () => {
		if (AutographaStore.isWarning === false) {
			this.setState({ timer: true });
			this.setState({ record: true });
			AutographaStore.isRecording = true;
			AutographaStore.isAudioSave = false;
		}
	};

	stopRecording = () => {
		AutographaStore.currentSession = false;
		AutographaStore.isRecording = false;
		this.setState({ record: false });
		if (
			AutographaStore.isWarning === false &&
			this.state.secondsElapsed > 0
		) {
			this.state.recVerse.push(this.state.onselect);
			this.state.recVerseTime.push({
				verse: this.state.onselect,
				totaltime: this.state.secondsElapsed,
			});
			AutographaStore.isWarning = true;
			this.setState({ timer: false });
			this.setState({
				totalTime: this.state.totalTime + this.state.secondsElapsed,
			});
		} else {
			this.setState({ timer: false });
			this.resetTimer();
		}
	};

	saveRecord = async (value, event) => {
		if (this.state.secondsElapsed > 0) {
			let save,
				book = {};
			value['verse'] = this.state.onselect;
			value['totaltime'] = this.state.secondsElapsed;
			let chapter = 'Chapter' + AutographaStore.chapterId;
			book.bookNumber = AutographaStore.bookId.toString();
			book.bookName =
				constants.booksList[parseInt(book.bookNumber, 10) - 1];
			this.setState({ recordedFiles: value });
			this.state.storeRecord.push(value);
			save = await saveRec.recSave(
				book,
				this.state.recordedFiles,
				chapter,
				this.state.onselect,
				this.state.recVerse,
				this.state.recVerseTime,
			);
			AutographaStore.recVerse = this.state.recVerse;
		}
	};

	exportAudio = async () => {
		let save,
			book = {};
		let chapter = 'Chapter' + AutographaStore.chapterId;
		book.bookNumber = AutographaStore.bookId.toString();
		book.bookName = constants.booksList[parseInt(book.bookNumber, 10) - 1];
		save = await mergeAudios(
			book,
			chapter,
			this.state.recVerse,
			this.state.storeRecord,
		);
	};

	reduceTimer = (deletedTime) => {
		this.setState({ totalTime: this.state.totalTime - deletedTime });
	};

	setOnselect = (vId) => {
		this.setState({ onselect: vId });
	};

	setRecverse = (value) => {
		this.state.recVerse.push(value);
		AutographaStore.recVerse = this.state.recVerse;
	};

	fetchTimer = (time) => {
		this.setState({
			totalTime: this.state.totalTime + time,
		});
	};
	updateJSON = (json) => {
		this.state.recVerseTime.push(json);
	};

	render() {
		return (
			<StoreContext.Provider
				value={{
					...this.state,
					toggleOpen: this.toggleOpen,
					selectNext: this.selectNext,
					selectPrev: this.selectPrev,
					resetVal: this.resetVal,
					startRecording: this.startRecording,
					stopRecording: this.stopRecording,
					saveRecord: this.saveRecord,
					getDB: this.getDB,
					setTimer: this.setTimer,
					resetTimer: this.resetTimer,
					exportAudio: this.exportAudio,
					reduceTimer: this.reduceTimer,
					setOnselect: this.setOnselect,
					setRecverse: this.setRecverse,
					fetchTimer: this.fetchTimer,
					updateJSON: this.updateJSON,
				}}>
				{this.props.children}
			</StoreContext.Provider>
		);
	}
}

export default StoreContextProvider;