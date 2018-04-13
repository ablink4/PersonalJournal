using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PortableJournal.ViewModel
{
    public class ViewModelNewScreen : IViewModel
    {
        private string _name;

        public ViewModelNewScreen() { }

        public string Name
        {
            get
            {
                return _name;
            }
        }
    }
}
