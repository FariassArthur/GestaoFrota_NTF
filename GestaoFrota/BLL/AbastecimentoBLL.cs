using CFSqlCe.Dal;
using GestaoFrota.DAL;
using GestaoFrota.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GestaoFrota.BLL
{
    public sealed class AbastecimentoBLL
    {

        #region Propriedades

        //Aplicando o Pattern Singleton
        static AbastecimentoBLL _instancia;
        public static AbastecimentoBLL Instancia
        {
            get { return _instancia ?? (_instancia = new AbastecimentoBLL()); }
        }

        #endregion

        #region Construtores

        private AbastecimentoBLL() { }

        #endregion

        AbastecimentoDAL dal = AbastecimentoDAL.Instancia;

        public void Update(Abastecimento info)
{
    // Validação básica de segurança antes de mandar para o banco
    if (info == null)
        throw new ArgumentNullException(nameof(info), "Os dados do abastecimento não podem ser nulos.");

    if (info.Id <= 0)
        throw new ArgumentException("ID inválido para atualização.");

    // Mantém a regra do seu projeto de sincronizar a string da data
    info.DataS = info.Data.ToShortDateString();

    // Envia para a DAL salvar no Entity Framework
    dal.Update(info);            
}

public void Delete(int id)
{
    // Validação de segurança
    if (id <= 0)
        throw new ArgumentException("ID inválido para exclusão.");

    // Envia a ordem de remoção para a DAL
    dal.Delete(id);
}

        public void Insert(Abastecimento info)
        {
            info.DataS = info.Data.ToShortDateString();
            dal.Insert(info);            
        }

        public List<DGridAbastecimentoInfo> List(DateTime dtInicial, DateTime dtFinal, Veiculo veiculo)
        {
            return dal.List(dtInicial, dtFinal, veiculo);
        }

        public List<DGridAbastecimentoInfo> ListParcialAnual(DateTime dtAtual, Veiculo veiculo)
        {
            return dal.ListParcialAnual(dtAtual, veiculo);           
        }
      
        public List<DGridAbastecimentoInfo> ListPorFiltro(DateTime dtInicial, DateTime dtFinal, Veiculo veiculo, int combustivel)
        {
           return dal.ListPorFiltro(dtInicial, dtFinal, veiculo, combustivel);            
        }
      
        public ConsumoInfo GetConsumo(DateTime dtInicial, DateTime dtFinal, Veiculo veiculo)
        {
            return dal.GetConsumo(dtInicial, dtFinal, veiculo);
        }

        public ConsumoInfo GetConsumoAnual(DateTime dtAtual, Veiculo veiculo)
        {
            return dal.GetConsumoAnual(dtAtual, veiculo);
        }

        public CustoDiario GetDiasRegistroParcialAnual(DateTime dtAtual, Veiculo veiculo) 
        {
            return dal.GetDiasRegistroParcialAnual(dtAtual, veiculo);
        }

        public CustoDiario GetDiasRegistro(DateTime dtInicial, DateTime dtFinal, Veiculo veiculo)
        {
            return dal.GetDiasRegistro(dtInicial, dtFinal, veiculo);
        }

        public List<Abastecimento> ListExport()
        {
            return dal.ListExport();
        }
       
        public void AnexarComprovante(int id, string pathComprovante)
        {
            dal.AnexarComprovante(id, pathComprovante);
        }

        public List<AutonomiaInfo> GetAutonomia(DateTime dataMes, Veiculo veiculo)
        {
            return dal.GetAutonomia(dataMes, veiculo);
        }
    }
}
