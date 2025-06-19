<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250430173919 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_update DROP FOREIGN KEY FK_FD772E459D86650F');
        $this->addSql('DROP INDEX IDX_FD772E459D86650F ON user_update');
        $this->addSql('ALTER TABLE user_update CHANGE user_id_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE user_update ADD CONSTRAINT FK_FD772E45A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_FD772E45A76ED395 ON user_update (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_update DROP FOREIGN KEY FK_FD772E45A76ED395');
        $this->addSql('DROP INDEX IDX_FD772E45A76ED395 ON user_update');
        $this->addSql('ALTER TABLE user_update CHANGE user_id user_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE user_update ADD CONSTRAINT FK_FD772E459D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_FD772E459D86650F ON user_update (user_id_id)');
    }
}
