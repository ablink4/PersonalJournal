using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Win32;
using PortableJournal.Helpers;
using PortableJournal.Model;

// thought: does it make sense to have a Journal instance, and set it based on the result of either
// New or Open?  => it does to me.  Does that mean that Open needs to return an instance of Journal?
// that seems odd, doesn't it?  It definitely implies that Open needs to be a static method, which...
// also doesn't make a lot of sense to me (right?)  Maybe it makes sense, just not with the terminology
// that I've been using, yeah?

namespace PortableJournal.ViewModel
{
    public class ViewModelMain : ObservableObject, IViewModel
    {
        private string _name;
        private ViewModelNewScreen _newScreenViewModel;
        private ViewModelJournal _journalViewModel;
        private IViewModel _currentViewModel;  // to switch between view models

        public ViewModelMain()
        {
            _newScreenViewModel = new ViewModelNewScreen();
            _journalViewModel = new ViewModelJournal();
            _currentViewModel = _newScreenViewModel;
        }

        public string Name
        {
            get
            {
                return _name ?? string.Empty;
            }
        }

        public IViewModel CurrentViewModel
        {
            get
            {
                return _currentViewModel;
            }
            set
            {
                _currentViewModel = value;
                RaisePropertyChanged("CurrentViewModel");                
            }
        }

        public RelayCommand NewCommand
        {
            get
            {
                // TODO: need to also create a journal here
                return new RelayCommand(OpenJournalView);
            }
        }

        public RelayCommand OpenCommand
        {
            get
            {
                // TODO: need to retrieve a journal from disk here
                return new RelayCommand(OpenJournalView);
            }
        }

        public void OpenJournalView(object parameter)
        {
            CurrentViewModel = _journalViewModel as IViewModel;
        }

        public RelayCommand CloseCommand
        {
            get
            {
                return new RelayCommand(CloseJournalView);
            }
        }

        public void CloseJournalView(object parameter)
        {
            CurrentViewModel = _newScreenViewModel as IViewModel;
        }

        public RelayCommand ExitCommand
        {
            get
            {
                return new RelayCommand(ExitApplication);
            }
        }

        void ExitApplication(object parameter)
        {
            System.Windows.Application.Current.Shutdown();
        }

        public RelayCommand ShowJournalView 
        {
            get
            {
                return new RelayCommand(SwitchToJournalView);
            }
        }

        void SwitchToJournalView(object parameter)
        {
            CurrentViewModel = _journalViewModel as IViewModel;
        }
    }
}
